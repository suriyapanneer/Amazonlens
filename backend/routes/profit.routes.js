const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { calculateProfit } = require('../controllers/profit.controller');

const router = Router();

router.post('/', requireAuth, calculateProfit);

module.exports = router;
