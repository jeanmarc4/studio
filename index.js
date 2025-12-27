 const express = require('express');
        const path = require('path');
        const app = express();
        const port = process.env.PORT || 8080;

        // Servir les fichiers statiques (votre index.html)
        app.use(express.static(path.join(__dirname)));

        app.get('/', (req, res) => {
          res.sendFile(path.join(__dirname, 'index.html'));
        });

        app.listen(port, () => {
          console.log(`App listening on port ${port}`);
        });