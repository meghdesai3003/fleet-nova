const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const rbac = require('../middleware/rbacMiddleware');
const {
  getMaintenanceRecords,
  getMaintenanceRecord,
  createMaintenanceRecord,
  closeMaintenanceRecord,
} = require('../controllers/maintenanceController');

router.use(authMiddleware);

router.get('/', getMaintenanceRecords);
router.get('/:id', getMaintenanceRecord);
router.post('/', rbac('FleetManager'), createMaintenanceRecord);
router.put('/:id/close', rbac('FleetManager'), closeMaintenanceRecord);

module.exports = router;