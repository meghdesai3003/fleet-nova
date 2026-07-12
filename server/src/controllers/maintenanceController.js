const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');

function getMaintenanceRecords(req, res) {
  res.json(Maintenance.getAll());
}

function getMaintenanceRecord(req, res) {
  const record = Maintenance.findById(req.params.id);
  if (!record) return res.status(404).json({ message: 'Maintenance record not found' });
  res.json(record);
}

function createMaintenanceRecord(req, res) {
  const { vehicleId, type, date, cost } = req.body;

  const vehicle = Vehicle.findById(vehicleId);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  const newRecord = {
    id: 'm' + Date.now(),
    vehicleId,
    type,
    date,
    cost,
    status: 'Active',
  };

  Maintenance.create(newRecord);

  // Rule: creating active maintenance auto-switches vehicle to "In Shop"
  Vehicle.update(vehicleId, { status: 'In Shop' });

  res.status(201).json(newRecord);
}

function closeMaintenanceRecord(req, res) {
  const record = Maintenance.findById(req.params.id);
  if (!record) return res.status(404).json({ message: 'Maintenance record not found' });
  if (record.status !== 'Active') {
    return res.status(400).json({ message: 'Only active maintenance records can be closed' });
  }

  const updated = Maintenance.update(record.id, { status: 'Closed' });

  // Rule: closing maintenance restores vehicle to Available, unless Retired
  const vehicle = Vehicle.findById(record.vehicleId);
  if (vehicle && vehicle.status !== 'Retired') {
    Vehicle.update(record.vehicleId, { status: 'Available' });
  }

  res.json(updated);
}

module.exports = { getMaintenanceRecords, getMaintenanceRecord, createMaintenanceRecord, closeMaintenanceRecord };