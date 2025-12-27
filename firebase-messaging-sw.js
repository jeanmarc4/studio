 // firebase-messaging-sw.js
    // Ce fichier DOIT être à la racine de votre domaine pour fonctionner correctement.

    // Importez les scripts requis pour Firebase (compat versions pour Service Worker)
    importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

    // Votre configuration Firebase (copiée depuis votre index.html ou équivalent)
    const firebaseConfig = {
      apiKey: "AIzaSyCFivVW-ObOgM2EI-WPCLHw9ni32kdC6vE",
      authDomain: "studio-9090208553-5057b.firebaseapp.com",
      projectId: "studio-9090208553-5057b",
      storageBucket: "studio-9090208553-5057b.firebasestorage.app",
      messagingSenderId: "520182578386",
      appId: "1:520182578386:web:de4467cfa3106eddd2c10b",
      measurementId: "G-D47MZ64L6J"
    };

    // Initialisez l'application Firebase
    firebase.initializeApp(firebaseConfig);

    // Récupérez l'instance de messagerie
    const messaging = firebase.messaging();

    // Gestion des messages en arrière-plan (quand la PWA n'est pas au premier plan)
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Reçu message en arrière-plan ', payload);

      const notificationTitle = payload.notification?.title || "Nouveau Rappel !";
      const notificationBody = payload.notification?.body || "Cliquez pour écouter le rappel.";

      const notificationOptions = {
        body: notificationBody,
        icon: '/firebase-logo.png', // Chemin vers une icône si vous en avez une à la racine
        data: {
          messageToSpeak: payload.notification?.body || payload.data?.messageText || "Rappel !", // Texte à lire
          originalUrl: self.location.origin // URL de base de votre PWA
        }
      };

      // Affiche la notification visuelle
      self.registration.showNotification(notificationTitle, notificationOptions);
    });

    // Gérer le clic sur la notification visuelle
    self.addEventListener('notificationclick', (event) => {
      event.notification.close(); // Ferme la notification après le clic

      const messageToSpeak = event.notification.data.messageToSpeak;
      const originalUrl = event.notification.data.originalUrl;

      event.waitUntil(
        // Ouvre l'application PWA (ou la ramène au premier plan)
        clients.openWindow(originalUrl).then(client => {
          if (client) {
            // Envoyer un message à la fenêtre nouvellement ouverte pour jouer l'audio
            // Ceci est une méthode de communication entre le Service Worker et la page.
            client.postMessage({ type: 'PLAY_SPEAKING_MESSAGE', message: messageToSpeak });
          } else {
            console.warn('Impossible d\'ouvrir la fenêtre client pour jouer l\'audio.');
            // Fallback si la fenêtre ne s'ouvre pas: (moins fiable pour le vocal)
            // On ne peut pas facilement faire du SpeechSynthesis directement dans un SW sans la fenêtre.
            // Une alternative serait de jouer un son prédéfini ici si possible.
          }
        })
      );
    });