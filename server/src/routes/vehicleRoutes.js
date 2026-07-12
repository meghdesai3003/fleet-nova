const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const rbac = require('../middleware/rbacMiddleware');
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');

router.use(authMiddleware);

router.get('/', getVehicles);
router.get('/:id', getVehicle);
router.post('/', rbac('FleetManager'), createVehicle);
router.put('/:id', rbac('FleetManager'), updateVehicle);
router.delete('/:id', rbac('FleetManager'), deleteVehicle);

module.exports = router;