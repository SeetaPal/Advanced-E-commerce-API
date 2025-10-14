const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');
const permit = require('../middleware/rolemiddleware');

router.get('/', productController.list);
router.post('/', auth, permit('ADMIN'), productController.create);
router.put('/:id', auth, permit('ADMIN'), productController.update); 
router.delete('/:id', auth, permit('ADMIN'), productController.remove);

module.exports = router;
