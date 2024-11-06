// Permettre à l'utilisateur de télécharger son fichier img
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Gérer l'extension du fichier
const MIME_TYPES = {
    'image/jpg' : 'jpg',
    'image/jpeg' : 'jpg',
    'image/png' : 'png',
    'image/webp' : 'webp'
}

// Enregistrer im sur le disk
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        // Enlever les espaces et les remplacer par un underscore
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        // Rendre le fichier le plus unique possible grâce au timestamp
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage }).single('image');


module.exports.resizeImage = (req, res, next) => {
    // On vérifie si un fichier a été téléchargé
    if (!req.file) {
        // Si aucun fichier, passe au middleware suivant
        return next();
    }
     // Récupération du chemin du fichier téléchargé et du nom de fichier
    // Chemin vers le fichier sur le disque
    const filePath = req.file.path;
    // Nom original du fichier
    const fileName = req.file.filename;
    // Chemin pour enregistrer l'image redimensionnée
    const outputFilePath = path.join('images', `resized_${fileName}`);
    console.log(`Redimensionnement de l'image: ${filePath} vers ${outputFilePath}`);
    // Utilisation de sharp pour redimensionner l'image
    sharp(filePath)
        .resize({ width: 400, height: 600 })
        // Enregistre l'image redimensionnée à l'emplacement spécifié
        .toFile(outputFilePath)
        .then(() => {
            // Après un redimensionnement réussi, supprime le fichier original
            fs.unlink(filePath, (error) => {
                if (error) {
                    console.error('Erreur lors de la suppression du fichier original:', error);
                }
                // Mettre à jour le chemin du fichier dans req.file
                req.file.path = outputFilePath; 
                // Passe au middleware suivant
                next();
            });
        })
        .catch((error) => {
            // Gestion des erreurs lors de la recherche dans la base de données
            console.error("Erreur lors de la récupération des livres:", error);
            res.status(500).json({ error: "Erreur interne du serveur." });
            return next();
        });
};












