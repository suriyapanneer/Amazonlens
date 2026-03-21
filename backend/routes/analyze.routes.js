const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { analyze } = require('../controllers/analyze.controller');

const router = Router();

router.post('/', requireAuth, analyze);

module.exports = router;
