const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { getMe } = require('../controllers/auth.controller');

const router = Router();

router.get('/me', requireAuth, getMe);

module.exports = router;
