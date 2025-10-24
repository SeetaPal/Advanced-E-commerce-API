
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/authMiddleware');
const permit = require('../middleware/rolemiddleware');


router.get('/', auth, permit('USER'), cartController.getCart);
router.post('/items',auth, permit('USER'), cartController.addOrUpdateItem);
router.delete('/items/:productId',  auth, permit('USER'), cartController.removeItem);

module.exports = router;
