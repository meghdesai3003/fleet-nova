const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getFuelLogs,
  createFuelLog,
  getExpenses,
  createExpense,
  getOperationalCost,
} = require('../controllers/fuelExpenseController');

router.use(authMiddleware);

router.get('/fuel', getFuelLogs);
router.post('/fuel', createFuelLog);
router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);
router.get('/cost/:vehicleId', getOperationalCost);

module.exports = router;