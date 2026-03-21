const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { generateReport, getReports, downloadReport } = require('../controllers/reports.controller');

const router = Router();

router.post('/generate', requireAuth, generateReport);
router.get('/',          requireAuth, getReports);
router.get('/:id/download', requireAuth, downloadReport);

module.exports = router;
