  import * as functions from "firebase-functions";
    import * as admin from "firebase-admin";

    // Initialisez l'application Admin SDK
    admin.initializeApp();

    const db = admin.firestore();       // Pour accéder à la base de données Firestore
    const messaging = admin.messaging(); // Pour envoyer des messages via Firebase Cloud Messaging

    // Cette fonction est programmée pour s'exécuter toutes les 4 minutes MAINTENANT.
    // Elle vérifie si des rappels doivent être envoyés pour les médicaments et les rendez-vous.
    export const sendScheduledReminders = functions.pubsub.schedule("every 4 minutes").onRun(async () => { // <-- CHANGÉ ICI (every 4 minutes)
      console.log("Démarrage de la vérification des rappels - VERSION FINALE !"); // <-- CHANGÉ ICI (nouveau message)

      const now = admin.firestore.Timestamp.now();
      const sixMinutesAgo = new Date(now.toDate().getTime() - 6 * 60 * 1000);

      const sendPromises: Promise<any>[] = []; // Tableau pour stocker toutes les promesses d'envoi et de mise à jour

      // --- Traitement des rappels de médicaments ---
      try {
        // IMPORTANT : Utilisation du nom de collection exact "medicaments" (sans les espaces)
        const medicamentsSnapshot = await db.collection("medicaments") // <-- CONFIRMÉ ICI (sans les espaces)
          .where("rappelSent", "==", false) // Le champ que nous utiliserons pour marquer l'envoi
          .where("rappelTime", "<=", now)     // Le champ de l'heure du rappel
          .where("rappelTime", ">", admin.firestore.Timestamp.fromDate(sixMinutesAgo))
          .get();

        if (medicamentsSnapshot.empty) {
          console.log("Aucun rappel de médicament à envoyer pour cette période.");
        } else {
          medicamentsSnapshot.forEach(doc => {
            const medicamentData = doc.data();
            const medicamentId = doc.id;

            // Vérifier si le jeton FCM est présent
            if (!medicamentData.fcmToken) {
              console.warn(`Rappel de médicament ${medicamentId} n'a pas de jeton FCM, impossible d'envoyer.`);
              sendPromises.push(doc.ref.update({ rappelSent: true, rappelSendError: "no_fcm_token_found" }));
              return;
            }
            if (!medicamentData.rappelMessage) {
                console.warn(`Rappel de médicament ${medicamentId} n'a pas de message, impossible d'envoyer.`);
                sendPromises.push(doc.ref.update({ rappelSent: true, rappelSendError: "no_rappel_message" }));
                return;
            }


            console.log(`Envoi rappel médicament ${medicamentId}: "${medicamentData.rappelMessage}" à l'utilisateur ${medicamentData.userId}`); // <-- CE LOG RESTE LE MÊME
            const messagePayload: admin.messaging.Message = {
              notification: {
                title: "Rappel Médicament !",
                body: medicamentData.rappelMessage,
              },
              data: {
                type: "medicament",
                itemId: medicamentId,
                messageText: medicamentData.rappelMessage,
              },
              token: medicamentData.fcmToken,
            };

            sendPromises.push(
              messaging.send(messagePayload)
                .then((response) => {
                  console.log(`Message FCM envoyé avec succès pour médicament ${medicamentId}:`, response);
                  return doc.ref.update({ rappelSent: true, rappelSentAt: admin.firestore.FieldValue.serverTimestamp() });
                })
                .catch((error) => {
                  console.error(`Erreur lors de l'envoi FCM pour médicament ${medicamentId}:`, error);
                  return doc.ref.update({ rappelSent: true, rappelSendError: error.message });
                })
            );
          });
        }
      } catch (error) {
        console.error("Erreur lors du traitement des rappels de médicaments:", error);
      }


      // --- Traitement des rappels de rendez-vous ---
      try {
        const rendezvousSnapshot = await db.collection("rendezvous")
          .where("rappelSent", "==", false)
          .where("rappelTime", "<=", now)
          .where("rappelTime", ">", admin.firestore.Timestamp.fromDate(sixMinutesAgo))
          .get();

        if (rendezvousSnapshot.empty) {
          console.log("Aucun rappel de rendez-vous à envoyer pour cette période.");
        } else {
          rendezvousSnapshot.forEach(doc => {
            const rendezvousData = doc.data();
            const rendezvousId = doc.id;

            // Vérifier si le jeton FCM est présent
            if (!rendezvousData.fcmToken) {
              console.warn(`Rappel de rendez-vous ${rendezvousId} n'a pas de jeton FCM, impossible d'envoyer.`);
              sendPromises.push(doc.ref.update({ rappelSent: true, rappelSendError: "no_fcm_token_found" }));
              return;
            }
            if (!rendezvousData.rappelMessage) {
                console.warn(`Rappel de rendez-vous ${rendezvousId} n'a pas de message, impossible d'envoyer.`);
                sendPromises.push(doc.ref.update({ rappelSent: true, rappelSendError: "no_rappel_message" }));
                return;
            }

            console.log(`Envoi rappel rendez-vous ${rendezvousId}: "${rendezvousData.rappelMessage}" à l'utilisateur ${rendezvousData.userId}`);
            const messagePayload: admin.messaging.Message = {
              notification: {
                title: "Rappel Rendez-vous !",
                body: rendezvousData.rappelMessage,
              },
              data: {
                type: "rendezvous",
                itemId: rendezvousId,
                messageText: rendezvousData.rappelMessage, // CORRIGÉ : s'assurer que c'est rappelMessage et non raappelMessage
              },
              token: rendezvousData.fcmToken,
            };

            sendPromises.push(
              messaging.send(messagePayload)
                .then((response) => {
                  console.log(`Message FCM envoyé avec succès pour rendez-vous ${rendezvousId}:`, response);
                  return doc.ref.update({ rappelSent: true, rappelSentAt: admin.firestore.FieldValue.serverTimestamp() });
                })
                .catch((error) => {
                  console.error(`Erreur lors de l'envoi FCM pour rendez-vous ${rendezvousId}:`, error);
                  return doc.ref.update({ rappelSent: true, rappelSendError: error.message });
                })
            );
          });
        }
      } catch (error) {
        console.error("Erreur lors du traitement des rappels de rendez-vous:", error);
      }


      // Attendez que toutes les opérations d'envoi et de mise à jour soient terminées
      try {
        await Promise.all(sendPromises);
        console.log("Traitement global des rappels terminé pour cette exécution.");
      } catch (e) {
        console.error("Erreur lors de la résolution de toutes les promesses d'envoi/mise à jour:", e);
      }

      return null;
    });
