const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getTrips,
  getTrip,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  deleteTrip,
} = require('../controllers/tripController');

router.use(authMiddleware);

router.get('/', getTrips);
router.get('/:id', getTrip);
router.post('/', createTrip);
router.put('/:id/dispatch', dispatchTrip);
router.put('/:id/complete', completeTrip);
router.put('/:id/cancel', cancelTrip);
router.delete('/:id', deleteTrip);

module.exports = router;