  importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

    // Votre configuration Firebase (la même que dans votre index.html)
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

    // Configuration pour gérer les messages en arrière-plan
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Reçu message en arrière-plan ', payload);

      const notificationTitle = payload.notification?.title || "Nouveau Rappel !";
      const notificationBody = payload.notification?.body || "Cliquez pour écouter le rappel.";
      const audioUrl = payload.data?.audioUrl; // Récupérez l'URL audio des données

      const notificationOptions = {
        body: notificationBody,
        icon: '/firebase-logo.png', // Vous pouvez ajouter une icône pour la notification
        data: {
          audioUrl: audioUrl, // Stockez l'URL audio dans les données de la notification
          originalUrl: self.location.origin // Stockez l'URL de votre PWA pour l'ouvrir
        }
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });

    // Gérer le clic sur la notification
    self.addEventListener('notificationclick', (event) => {
      event.notification.close(); // Ferme la notification

      const audioUrl = event.notification.data.audioUrl;
      const originalUrl = event.notification.data.originalUrl;

      event.waitUntil(
        clients.openWindow(originalUrl).then(client => {
          if (client) {
            // Envoyer un message à la fenêtre nouvellement ouverte pour jouer l'audio
            // Ceci est une méthode de communication entre le Service Worker et la page.
            client.postMessage({ type: 'PLAY_AUDIO', audioUrl: audioUrl });
          } else {
            console.warn('Impossible d\'ouvrir la fenêtre client pour jouer l\'audio.');
            // Fallback: Si la fenêtre ne s'ouvre pas, vous pourriez essayer de jouer directement ici (moins fiable)
            if (audioUrl) {
                const audio = new Audio(audioUrl);
                audio.play().catch(e => console.error("Erreur de lecture audio dans SW:", e));
            }
          }
        })
      );
    });