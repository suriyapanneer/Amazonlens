const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { getProducts, getSellable, deleteProduct } = require('../controllers/products.controller');

const router = Router();

router.get('/',         requireAuth, getProducts);
router.get('/sellable', requireAuth, getSellable);
router.delete('/:asin', requireAuth, deleteProduct);

module.exports = router;
