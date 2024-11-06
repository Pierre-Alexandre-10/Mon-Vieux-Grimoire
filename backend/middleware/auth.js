const jwt = require('jsonwebtoken');

// Extraire et contrôler les informations du token
module.exports = (req, res, next) => {
    try {
        // Récupérer le token dans le header - split pour récupérer le token sans le 'bearer'
        const token = req.headers.authorization.split(' ')[1];
        // Décoder le token token + clé secrète (Utiliser un clé secrète beaucoup plus longue et random en prod !!!)
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next();
    } catch(error) {
        res.status(401).json({ error })
    }
}