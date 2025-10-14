const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const permit = require('../middleware/rolemiddleware');

router.get('/orders', auth, permit('ADMIN'), adminController.listOrders);
router.patch('/orders/:id/status', auth, permit('ADMIN'), adminController.updateStatus);

module.exports = router;
