const Book = require('../models/book');
const fs = require('fs')

                                                            // OPERATION CRUD 

// GET => Récupérer de l'ensemble des livres
exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

// GET => Récupérer un livre selon l'id souhaitée
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id : req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

// POST => Création d'une nouvel fiche pour un livre 
exports.createBook = (req, res, next) => {
    // Convertir l'objet contenant chaîne de caractère au format JSON
    const bookObject = JSON.parse(req.body.book);    
    // Suppression de l'id de l'objet envoyer par le front (Garder uniquement l'id de mongoDB)
    delete req.body._id;   
    // Suppression de l'id user pour utiliser uniquement l'id présent en bdd 
    delete req.body.userId;    
    // Création de nouvel instance de model
    const book = new Book ({
        // Utilisation de l'opérateur Spread, pour copier les champs dans le body de la requête
        ...bookObject,
        // Utlisation du userId provenant de la bdd
        userId: req.auth.userId,
        // Générer l'url de l'image manuellement 
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}`
    });
    // Enregistrer le nouvel objet dans BDD
    book.save()
    .then(() => res.status(201).json({ message: "Objet enregisté" }))
    .catch(error => res.status(400).json({ error }));
};

// PUT => Modification d'un livre déja existant 
exports.modifyBook = (req, res, next) => {
        // Convertir l'objet contenant chaîne de caractère au format JSON
   const bookObject = req.file ? {
       ...JSON.parse(req.body.book),
       imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}`
   } : { ...req.body };
   
   // Supprimer le champ _userId pour éviter les modifications non autorisées
   delete bookObject._userId;
   Book.findOne({_id: req.params.id})
       .then((book) => {
            // Seul le créateur de la fiche du livre peux la supprimer
           if (book.userId !== req.auth.userId) {
               res.status(403).json({ message : '403 : Not authorized'});
           } else {

                // Supprimer les images pour éviter les accumulations dans le dossier images
                const filename = book.imageUrl.split('/images/')[1];
                // Si l'image a été modifiée, on supprime l'ancienne
                req.file && fs.unlink(`images/${filename}`, (err => {
                        if (err) console.log(err);
                    })
                );

               // Mettre a jour le livre 
               Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
               .then(() => res.status(200).json({message : 'Objet modifié!'}))
               .catch(error => res.status(401).json({ error }));
           }
       })
       .catch((error) => {
           res.status(500).json({ error });
       });
};

// DELETE => Suppression d'un livre existant 
exports.deleteBook = (req, res, next) => {
    // Récupération du livre a supprimer
    Book.findOne({ _id : req.params.id })
        .then(book => {
            // Seul le créateur de la fiche du livre peux la supprimer
            if (book.userId !== req.auth.userId) {
                res.status(403).json({ message : " 403: unauthorized request" });
            } else {
                // Séparation du fichier  image
                const filename = book.imageUrl.split('/images/')[1];
                // Suppression image et livre dans la BDD
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                    .then( () => {res.status(200).json({ message: 'Objet supprimé'})})
                    .catch( error => res.status(500).json({ error }));
                })
            }
        })
        .catch(error => {res.status(500).json({ error })});
}; 


// POST => Ajoute une note à un livre selon son ID
exports.ratingBook = (req, res, next) => {
    // Vérifie que le userId associé au token est le même que celui de la requête
    if (req.body.userId === req.auth.userId) {
        // Cherche le livre associé à l'id du paramètre de l'URL
        Book.findById(req.params.id)
        .then((book) => {
            // Cherche si l'utilisateur n'a pas déjà noté le livre
            const foundRating = book.ratings.find(rating => rating.userId === req.body.userId)
            if (foundRating) {
                res.status(403).json({ message: "403: unauthorized request" })
            } else {
                // Ajoute l'objet (user id et note) au tableau ratings du livre trouvé
                book.ratings.push({userId: req.auth.userId, grade: req.body.rating})
                // Calcul la nouvelle moyenne
                let sum = 0
                for (let oneBook of book.ratings) {
                    sum += oneBook.grade || 0;
                }
                const averageRating = sum / book.ratings.length;
                // Met à jour la moyenne dans l'objet book
                book.averageRating = averageRating;
                // Met à jour la BDD en envoyant juste le tableau ratings
                Book.updateOne({ _id: req.params.id }, { ratings: book.ratings, averageRating: book.averageRating })
                    .then(() => res.status(200).json( book ))                 
                    .catch(error => res.status(400).json({ error }));
                    console.log(book);                    
            }

        })
        .catch(error => res.status(400).json({ error }));
    } else {
        res.status(403).json({ message: "Modification non autorisé"})
    }
};

// GET => Récupération des 3 livres les mieux notés
exports.getBestRating = (req, res, next) => {
    // Récupération de l'ensemble des livres
    // Effectuer le tri dans un ordre décroissant (-1) avec une limite de 3 livres.
    Book.find()
        .sort({ averageRating: -1 }) // Tri par moyenne des notes
        .limit(3) // Limite à 3 livres
        .then((books) => {
            // Vérification si des livres ont été trouvés
            if (books.length === 0) {
                return res.status(404).json({ message: "Aucun livre trouvé." });
            }
            res.status(200).json(books); // Envoi des livres au format JSON
        })
        .catch((error) => {
            // Gestion des erreurs lors de la recherche dans la base de données
            console.error("Erreur lors de la récupération des livres:", error);
            res.status(500).json({ error: "Erreur interne du serveur." });
        });
};