const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { getStorageOverview, deleteData } = require('../controllers/storage.controller');

const router = Router();

router.get('/',        requireAuth, getStorageOverview);
router.post('/delete', requireAuth, deleteData);

module.exports = router;
