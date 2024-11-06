// Importer bcrypt
const bcrypt = require('bcrypt');
// Importer JsonWebToken
const jwt = require('jsonwebtoken')
// Importer le models user
const User = require('../models/user');

require('dotenv').config();
const secretKey = process.env.SECRET_KEY;

exports.signup = (req, res, next) => {
    // Récupère le mdp dans l'input et le hash avec bcrypt (éxécute l'algo 10fois)
    bcrypt.hash(req.body.password, 10)
    // Récupère le hash du mdp
    .then(hash => {
        // Création nouvel utilisateur
        const user = new User({
            // Utilisation du email provenant du corp de la requete
            email: req.body.email,
            // Utilisation du hash du mdp provenant du corp de la requete
            password: hash
        });
        // Enregistrer le user dans la BDD
        user.save()
        .then(() => res.status(201).json({ message : 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    // Envoie une erreur avec code 500 sous forme d'objet
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    // Recherche de l'utilisateur par l'email founit dans le corp
    User.findOne({ email: req.body.email })
    // Gestion de la réponse
    .then(user => {
        if (user === null) {
            res.status(401).json({ message : 'Paire identifiant / Mot de pass incorrect' });
        } else {
            // Comparer le résultats du mdp
            bcrypt.compare(req.body.password, user.password)
            // Valid = true
            .then(valid => {
                if (!valid) {
                    res.status(401).json({ message: 'Paire identifiant / Mot de pass incorrect' });
                } else {
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            // Données à encoder
                            { userId: user._id },
                            // Clé secrète d'encodage, permet de garantir 
                            // que seul le ou les serveurs ayant accès a cette 
                            // clé peut créer des tokens et vérifier leur 
                            // intégrité
                            secretKey, // (Utiliser un clé secrète beaucoup plus longue et random en prod !!!)
                            // Délais d'expiration du token
                            { expiresIn: '24h' }
                        )
                    })
                }
            })
            .catch(error => res.status(500).json({ error }))
        }
    })
    .catch(error => {
        res.status(500).json({ error })
    })
};

