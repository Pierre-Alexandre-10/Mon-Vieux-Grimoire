// Importer le package natif de node ;
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/book');
const path = require('path');
require('dotenv').config();
const dbLogin = process.env.DB_LOGIN;


// Stocker le package dans app
const app = express();

// Intercepte toutes les requêtes JSON pour l'objet requête
app.use(express.json());

// Connexion BDD MogoDB
mongoose.connect(`mongodb+srv://${dbLogin}@cluster0.rfb9v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log('Connexion à MongoDB échouée !', error));

// CORS Cross Origin Resource Sharing : Autorise la communication entre le front et le back
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Gestion des images de manière statique
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes des fonctionnalités book et user
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;
