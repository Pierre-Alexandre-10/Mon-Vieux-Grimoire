const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');

// Envoie en post email et mdp
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;