const multer = require('multer');
const { MAX_FILE_SIZE } = require('../config/constants');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = { upload };
