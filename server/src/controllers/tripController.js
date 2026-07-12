const Trip = require('../models/Trip');
const businessRules = require('../services/businessRules');

function getTrips(req, res) {
  res.json(Trip.getAll());
}

function getTrip(req, res) {
  const trip = Trip.findById(req.params.id);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  res.json(trip);
}

// Create trip as Draft — no status changes yet
function createTrip(req, res) {
  const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, freightRevenue } = req.body;

  const validation = businessRules.validateTripCreation({ vehicleId, driverId, cargoWeight });
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  const newTrip = {
    id: 't' + Date.now(),
    source,
    destination,
    vehicleId,
    driverId,
    cargoWeight,
    plannedDistance,
    freightRevenue: freightRevenue || 0, // amount billed to the customer for this trip
    status: 'Draft',
  };

  const created = Trip.create(newTrip);
  res.status(201).json(created);
}

// Draft -> Dispatched
function dispatchTrip(req, res) {
  const trip = Trip.findById(req.params.id);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  if (trip.status !== 'Draft') {
    return res.status(400).json({ message: 'Only Draft trips can be dispatched' });
  }

  const validation = businessRules.validateTripCreation({
    vehicleId: trip.vehicleId,
    driverId: trip.driverId,
    cargoWeight: trip.cargoWeight,
  });
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  businessRules.dispatchTrip(trip.vehicleId, trip.driverId);
  const updated = Trip.update(trip.id, { status: 'Dispatched' });
  res.json(updated);
}

// Dispatched -> Completed
function completeTrip(req, res) {
  const trip = Trip.findById(req.params.id);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  if (trip.status !== 'Dispatched') {
    return res.status(400).json({ message: 'Only Dispatched trips can be completed' });
  }

  const { finalOdometer, fuelConsumed } = req.body;
  businessRules.completeTrip(trip.vehicleId, trip.driverId, finalOdometer);

  const updated = Trip.update(trip.id, {
    status: 'Completed',
    finalOdometer,
    fuelConsumed,
  });
  res.json(updated);
}

// Dispatched -> Cancelled
function cancelTrip(req, res) {
  const trip = Trip.findById(req.params.id);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  if (trip.status !== 'Dispatched') {
    return res.status(400).json({ message: 'Only Dispatched trips can be cancelled' });
  }

  businessRules.cancelTrip(trip.vehicleId, trip.driverId);
  const updated = Trip.update(trip.id, { status: 'Cancelled' });
  res.json(updated);
}

// Delete a Draft trip permanently
function deleteTrip(req, res) {
  const trip = Trip.findById(req.params.id);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  if (trip.status !== 'Draft') {
    return res.status(400).json({ message: 'Only Draft trips can be deleted' });
  }
  Trip.remove(trip.id);
  res.json({ message: 'Draft trip deleted' });
}

module.exports = { getTrips, getTrip, createTrip, dispatchTrip, completeTrip, cancelTrip, deleteTrip };