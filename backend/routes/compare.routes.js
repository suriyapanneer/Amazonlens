const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { compareProducts } = require('../controllers/compare.controller');

const router = Router();

router.post('/', requireAuth, compareProducts);

module.exports = router;
