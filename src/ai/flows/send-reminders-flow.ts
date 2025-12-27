'use server';
/**
 * @fileOverview Un flow unifié pour envoyer toutes les notifications de rappel.
 * - Rappels de bienvenue pour les nouveaux utilisateurs.
 * - Rappels de rendez-vous à venir.
 * - Rappels de prise de médicaments.
 *
 * - sendReminders - Une fonction qui exécute ces trois tâches.
 */

import {ai} from '@/ai/genkit';
import {getSdks, initializeFirebaseAdmin} from '@/firebase/server';
import type {User, Appointment, Medication} from '@/lib/types';
import {Timestamp, FieldValue} from 'firebase-admin/firestore';
import {getMessaging} from 'firebase-admin/messaging';
import type {MulticastMessage} from 'firebase-admin/messaging';

// Initialise Firebase Admin pour que ce flow serveur puisse l'utiliser.
initializeFirebaseAdmin();

/**
 * Envoie des notifications de bienvenue aux utilisateurs non validés.
 */
async function sendWelcomeNotifications() {
  const {firestore} = getSdks();
  const messaging = getMessaging();
  console.log(
    'Vérification des nouveaux utilisateurs pour les notifications de bienvenue...'
  );

  const usersToWelcomeSnapshot = await firestore
    .collection('users')
    .where('validated', '==', false)
    .get();

  if (usersToWelcomeSnapshot.empty) {
    console.log('Aucun nouvel utilisateur à valider.');
    return 0;
  }

  let welcomeSentCount = 0;
  for (const userDoc of usersToWelcomeSnapshot.docs) {
    const userId = userDoc.id;
    const userData = userDoc.data() as User;

    if (!userData.fcmTokens || userData.fcmTokens.length === 0) {
      console.warn(`Pas de jetons FCM pour l'utilisateur à valider ${userId}.`);
      await userDoc.ref.update({validated: true});
      continue;
    }

    const name = userData.email || 'Cher utilisateur';

    const message: MulticastMessage = {
      data: {
        type: 'account_validation',
        title: `Bienvenue, ${name} !`,
        body: 'Bienvenue sur Santé Zen ! Nous sommes ravis de vous compter parmi nous.',
        channelId: 'welcome',
      },
      tokens: userData.fcmTokens,
    };

    try {
      const response = await messaging.sendEachForMulticast(message);
      console.log(
        `Notification de bienvenue envoyée avec succès à ${response.successCount} appareils pour l'utilisateur ${userId}.`
      );
      welcomeSentCount += response.successCount;

      await userDoc.ref.update({validated: true});

      if (response.failureCount > 0) {
        const tokensToRemove: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (
            !resp.success &&
            resp.error &&
            [
              'messaging/invalid-registration-token',
              'messaging/registration-token-not-registered',
            ].includes(resp.error.code)
          ) {
            tokensToRemove.push(userData.fcmTokens![idx]);
          }
        });
        if (tokensToRemove.length > 0) {
          console.log(
            `Suppression de ${tokensToRemove.length} jetons invalides pour l'utilisateur ${userId}.`
          );
          await userDoc.ref.update({
            fcmTokens: FieldValue.arrayRemove(...tokensToRemove),
          });
        }
      }
    } catch (error) {
      console.error(
        `Erreur lors de l'envoi de la notification de bienvenue à l'utilisateur ${userId}:`,
        error
      );
    }
  }
  return welcomeSentCount;
}

/**
 * Envoie des rappels pour les rendez-vous prévus dans l'heure à venir.
 */
async function sendAppointmentReminders() {
  console.log('Début de la vérification des rappels de rendez-vous...');
  const {firestore} = getSdks();
  const messaging = getMessaging();
  const now = new Date();

  const executionWindowStart = Timestamp.fromDate(now);
  const executionWindowEnd = Timestamp.fromMillis(
    now.getTime() + 60 * 60 * 1000 - 1
  );

  console.log(
    `Fenêtre de vérification pour les rdv: ${executionWindowStart
      .toDate()
      .toISOString()} à ${executionWindowEnd.toDate().toISOString()}`
  );

  const allUpcomingAppointmentsSnapshot = await firestore
    .collectionGroup('appointments')
    .where('dateTime', '>', executionWindowStart)
    .get();

  if (allUpcomingAppointmentsSnapshot.empty) {
    console.log('Aucun rendez-vous à venir trouvé.');
    return 0;
  }

  const appointmentsToRemind: (Appointment & {user: User})[] = [];

  for (const doc of allUpcomingAppointmentsSnapshot.docs) {
    const appointment = {id: doc.id, ...doc.data()} as Appointment;

    const reminderMinutes = parseInt(appointment.reminder, 10);
    if (isNaN(reminderMinutes)) continue;

    const appointmentTime = (
      appointment.dateTime as unknown as Timestamp
    ).toDate();
    const reminderTime = new Date(
      appointmentTime.getTime() - reminderMinutes * 60 * 1000
    );
    const reminderTimestamp = Timestamp.fromDate(reminderTime);

    if (
      reminderTimestamp >= executionWindowStart &&
      reminderTimestamp < executionWindowEnd
    ) {
      const userDoc = await firestore
        .collection('users')
        .doc(appointment.userId)
        .get();
      if (userDoc.exists) {
        const user = userDoc.data() as User;
        if (user.fcmTokens && user.fcmTokens.length > 0) {
          appointmentsToRemind.push({...appointment, user});
        }
      }
    }
  }

  if (appointmentsToRemind.length === 0) {
    console.log('Aucun rappel de rendez-vous à envoyer dans cette fenêtre.');
    return 0;
  }

  let sentCount = 0;
  for (const {user, ...appointment} of appointmentsToRemind) {
    const appointmentDate = (
      appointment.dateTime as unknown as Timestamp
    ).toDate();
    const formattedTime = appointmentDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    });
    const formattedDate = appointmentDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    const reminderMinutes = parseInt(appointment.reminder, 10);
    let reminderText = `${reminderMinutes} minutes`;
    if (reminderMinutes === 60) reminderText = '1 heure';
    else if (reminderMinutes > 60 && reminderMinutes % 60 === 0)
      reminderText = `${reminderMinutes / 60} heures`;

    const message: MulticastMessage = {
      data: {
        type: 'appointment_reminder',
        title: 'Rappel de Rendez-vous',
        body: `Votre rdv avec ${appointment.doctorName} est prévu ${formattedDate} à ${formattedTime}. (Rappel programmé ${reminderText} avant)`,
        channelId: 'reminders',
        ...(appointment.voiceReminderMessage && {
          voiceUrl: appointment.voiceReminderMessage,
        }),
      },
      tokens: user.fcmTokens!,
    };

    try {
      const response = await messaging.sendEachForMulticast(message);
      console.log(
        `Rappels de rdv : ${response.successCount} messages envoyés avec succès pour l'utilisateur ${user.id}`
      );
      sentCount += response.successCount;
    } catch (error) {
      console.error(
        `Erreur lors de l'envoi de la notification de rdv pour l'utilisateur ${user.id}:`,
        error
      );
    }
  }

  console.log(
    `Vérification des rappels de rdv terminée. Total de ${sentCount} notifications envoyées.`
  );
  return sentCount;
}

/**
 * Envoie des rappels pour les médicaments à prendre dans l'heure.
 */
async function sendMedicationReminders() {
  console.log('Début de la vérification des rappels de médicaments...');
  const {firestore} = getSdks();
  const messaging = getMessaging();

  const now = new Date();
  const frenchTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    weekday: 'long',
    hour: 'numeric',
    hour12: false,
  });

  const parts = frenchTimeFormatter.formatToParts(now);
  let currentDay = '';
  let currentHour = 0;

  parts.forEach(part => {
    if (part.type === 'weekday') {
      currentDay = part.value;
    }
    if (part.type === 'hour') {
      currentHour = parseInt(part.value, 10);
    }
  });

  if (!currentDay) {
    console.error('Impossible de déterminer le jour actuel en France.');
    return 0;
  }

  const capitalizedDay =
    currentDay.charAt(0).toUpperCase() + currentDay.slice(1);
  console.log(
    `Vérification des médicaments pour ${capitalizedDay}, heure ${currentHour} (heure de Paris).`
  );

  const medicationsSnapshot = await firestore
    .collectionGroup('medications')
    .where('days', 'array-contains', capitalizedDay)
    .get();

  const medicationsDue: (Medication & {userId: string})[] = [];

  medicationsSnapshot.docs.forEach(doc => {
    const medication = {id: doc.id, ...doc.data()} as Medication;
    const parentPath = doc.ref.parent.parent;
    if (!parentPath) return;

    const userId = parentPath.id;

    medication.times.forEach(time => {
      const [hour] = time.split(':').map(Number);
      if (hour === currentHour) {
        medicationsDue.push({...medication, userId});
      }
    });
  });

  if (medicationsDue.length === 0) {
    console.log('Aucun rappel de médicament à envoyer pour cette heure.');
    return 0;
  }
  
  let sentCount = 0;

  for (const med of medicationsDue) {
    const userDoc = await firestore.collection('users').doc(med.userId).get();
    if (!userDoc.exists) continue;

    const user = userDoc.data() as User;
    const tokens = user.fcmTokens;

    if (tokens && tokens.length > 0) {
      const message: MulticastMessage = {
        data: {
          type: 'medication_reminder',
          title: 'Rappel de Médicament',
          body: `Il est l'heure de prendre votre ${med.name} (${med.dosage}).`,
          channelId: 'reminders',
          ...(med.voiceReminderMessage && {
            voiceUrl: med.voiceReminderMessage,
          }),
        },
        tokens: tokens,
      };

      try {
        const response = await messaging.sendEachForMulticast(message);
        console.log(
          `Rappels de médicaments : ${response.successCount} messages envoyés avec succès pour l'utilisateur ${med.userId}`
        );
        sentCount += response.successCount;
      } catch (error) {
        console.error(
          `Erreur lors de l'envoi de la notification de médicament pour l'utilisateur ${med.userId}:`,
          error
        );
      }
    }
  }

  console.log(
    `Vérification des rappels de médicaments terminée. Total de ${sentCount} notifications envoyées.`
  );
  return sentCount;
}

/**
 * Flow principal qui orchestre l'envoi de toutes les notifications.
 */
export const sendRemindersFlow = ai.defineFlow(
  {
    name: 'sendRemindersFlow',
  },
  async () => {
    try {
      const [
        welcomeNotificationsSent,
        appointmentRemindersSent,
        medicationRemindersSent,
      ] = await Promise.all([
        sendWelcomeNotifications(),
        sendAppointmentReminders(),
        sendMedicationReminders(),
      ]);

      const result = {
        success: true,
        welcomeSent: welcomeNotificationsSent,
        appointmentsSent: appointmentRemindersSent,
        medicationsSent: medicationRemindersSent,
      };

      console.log('Flow de rappels terminé avec succès:', result);
      return result;
    } catch (error) {
      console.error('Erreur dans le flow de rappels principal:', error);
      return {success: false, error: (error as Error).message};
    }
  }
);
