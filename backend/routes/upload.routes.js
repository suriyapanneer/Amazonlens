const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { uploadXray, uploadCerebro, uploadBlackBox } = require('../controllers/upload.controller');

const router = Router();

router.post('/xray',     requireAuth, upload.single('file'), uploadXray);
router.post('/cerebro',  requireAuth, upload.single('file'), uploadCerebro);
router.post('/blackbox', requireAuth, upload.single('file'), uploadBlackBox);

module.exports = router;
