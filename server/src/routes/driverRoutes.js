const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const rbac = require('../middleware/rbacMiddleware');
const {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
} = require('../controllers/driverController');

router.use(authMiddleware);

router.get('/', getDrivers);
router.get('/:id', getDriver);
router.post('/', rbac('FleetManager', 'SafetyOfficer'), createDriver);
router.put('/:id', rbac('FleetManager', 'SafetyOfficer'), updateDriver);
router.delete('/:id', rbac('FleetManager', 'SafetyOfficer'), deleteDriver);

module.exports = router;