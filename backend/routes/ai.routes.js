const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { getMarketInsights, getProductAnalysis } = require('../controllers/ai.controller');

const router = Router();

router.post('/market-insights',   requireAuth, getMarketInsights);
router.post('/product-analysis',  requireAuth, getProductAnalysis);

module.exports = router;
