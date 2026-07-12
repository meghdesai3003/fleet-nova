const Vehicle = require('../models/Vehicle');

function getVehicles(req, res) {
  res.json(Vehicle.getAll());
}

function getVehicle(req, res) {
  const vehicle = Vehicle.findById(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  res.json(vehicle);
}

function createVehicle(req, res) {
  const { registrationNumber } = req.body;
  const existing = Vehicle.getAll().find(
    v => v.registrationNumber.toLowerCase() === registrationNumber?.toLowerCase()
  );
  if (existing) {
    return res.status(400).json({ message: 'Registration number already exists' });
  }

  const newVehicle = {
    id: 'v' + Date.now(),
    status: 'Available',
    ...req.body,
  };
  const created = Vehicle.create(newVehicle);
  res.status(201).json(created);
}

function updateVehicle(req, res) {
  const updated = Vehicle.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Vehicle not found' });
  res.json(updated);
}

function deleteVehicle(req, res) {
  const deleted = Vehicle.remove(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Vehicle not found' });
  res.json({ message: 'Vehicle deleted' });
}

module.exports = { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle };