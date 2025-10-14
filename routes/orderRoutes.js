const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

router.post('/checkout', auth, orderController.checkout);
router.post('/:id/pay', auth, orderController.pay);
router.get('/', auth, orderController.getOrders);
router.get('/:id', auth, orderController.getOrder);

module.exports = router;
