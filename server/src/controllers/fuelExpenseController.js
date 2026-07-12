const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');
const Maintenance = require('../models/Maintenance');

function getFuelLogs(req, res) {
  res.json(FuelLog.getAll());
}

function createFuelLog(req, res) {
  const { vehicleId, liters, cost, date } = req.body;
  const newLog = { id: 'f' + Date.now(), vehicleId, liters, cost, date };
  FuelLog.create(newLog);
  res.status(201).json(newLog);
}

function getExpenses(req, res) {
  res.json(Expense.getAll());
}

function createExpense(req, res) {
  const { vehicleId, type, amount, date } = req.body;
  const newExpense = { id: 'e' + Date.now(), vehicleId, type, amount, date };
  Expense.create(newExpense);
  res.status(201).json(newExpense);
}

// Total operational cost per vehicle = Fuel + Maintenance (per spec 3.7)
function getOperationalCost(req, res) {
  const { vehicleId } = req.params;

  const fuelTotal = FuelLog.getAll()
    .filter(f => f.vehicleId === vehicleId)
    .reduce((sum, f) => sum + f.cost, 0);

  const maintenanceTotal = Maintenance.getAll()
    .filter(m => m.vehicleId === vehicleId)
    .reduce((sum, m) => sum + m.cost, 0);

  res.json({
    vehicleId,
    fuelCost: fuelTotal,
    maintenanceCost: maintenanceTotal,
    totalOperationalCost: fuelTotal + maintenanceTotal,
  });
}

module.exports = { getFuelLogs, createFuelLog, getExpenses, createExpense, getOperationalCost };