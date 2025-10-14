const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');
const permit = require('../middleware/rolemiddleware');

router.post('/checkout', auth, permit('USER'), orderController.checkout);
router.post('/:id/pay', auth, permit('USER'), orderController.pay);
router.get('/', auth, permit('USER'), orderController.getOrders);
router.get('/:id', auth, permit('USER'), orderController.getOrder);

module.exports = router;
