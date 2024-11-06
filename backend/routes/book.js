const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config')
const auth = require('../middleware/auth')
const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestRating);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', auth, multer, multer.resizeImage, bookCtrl.createBook);
router.post('/:id/rating', auth, bookCtrl.ratingBook);
router.put('/:id', auth, multer, multer.resizeImage, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;

// multer.resizeImage,