const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getReports } = require('../controllers/reportController');

router.use(authMiddleware);
router.get('/', getReports);

module.exports = router;