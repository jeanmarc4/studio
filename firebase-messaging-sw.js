importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

    // Votre configuration Firebase (VOTRE config existante)
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
    // Lorsque le navigateur est fermé ou que l'onglet n'est pas actif
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Reçu message en arrière-plan ', payload);
      
      const notificationTitle = payload.notification?.title || "Nouveau Rappel !";
      const notificationBody = payload.notification?.body || "Vous avez un nouveau rappel.";
      
      const notificationOptions = {
        body: notificationBody,
        icon: '/firebase-logo.png' // Optionnel: Ajoutez un chemin vers une petite icône pour la notification
        // Vous pouvez ajouter des actions, des tags, etc. ici
      };

      self.registration.showNotification(notificationTitle, notificationOptions);

      // BONUS: Pour le vocal en arrière-plan, c'est plus complexe car le Service Worker
      // n'a pas accès direct à l'API SpeechSynthesis. Cela nécessiterait des API plus avancées
      // comme la Background Fetch API ou de déclencher une notification qui lance votre app.
      // Pour l'instant, la lecture vocale se fera quand la page est active.
    });