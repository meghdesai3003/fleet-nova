const Driver = require('../models/Driver');

function getDrivers(req, res) {
  res.json(Driver.getAll());
}

function getDriver(req, res) {
  const driver = Driver.findById(req.params.id);
  if (!driver) return res.status(404).json({ message: 'Driver not found' });
  res.json(driver);
}

function createDriver(req, res) {
  const newDriver = {
    id: 'd' + Date.now(),
    status: 'Available',
    ...req.body,
  };
  const created = Driver.create(newDriver);
  res.status(201).json(created);
}

function updateDriver(req, res) {
  const updated = Driver.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Driver not found' });
  res.json(updated);
}

function deleteDriver(req, res) {
  const deleted = Driver.remove(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Driver not found' });
  res.json({ message: 'Driver deleted' });
}

module.exports = { getDrivers, getDriver, createDriver, updateDriver, deleteDriver };