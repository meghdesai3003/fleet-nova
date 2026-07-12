const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');
const Maintenance = require('../models/Maintenance');

function getFuelLogs(req, res) {
  res.json(FuelLog.getAll());
}

function createFuelLog(req, res) {
  const { vehicleId, liters, cost, date } = req.body;

  if (!vehicleId) return res.status(400).json({ message: 'vehicleId is required' });
  if (!liters || isNaN(Number(liters)) || Number(liters) <= 0)
    return res.status(400).json({ message: 'liters must be a positive number' });
  if (!cost || isNaN(Number(cost)) || Number(cost) <= 0)
    return res.status(400).json({ message: 'cost must be a positive number' });
  if (!date) return res.status(400).json({ message: 'date is required' });

  const newLog = {
    id: 'f' + Date.now(),
    vehicleId,
    liters: Number(liters),
    cost: Number(cost),
    date,
  };
  FuelLog.create(newLog);
  res.status(201).json(newLog);
}

function getExpenses(req, res) {
  res.json(Expense.getAll());
}

function createExpense(req, res) {
  const { vehicleId, type, amount, date } = req.body;

  if (!vehicleId) return res.status(400).json({ message: 'vehicleId is required' });
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
    return res.status(400).json({ message: 'amount must be a positive number' });
  if (!date) return res.status(400).json({ message: 'date is required' });
  if (!type) return res.status(400).json({ message: 'type is required' });

  const newExpense = {
    id: 'e' + Date.now(),
    vehicleId,
    type,
    amount: Number(amount),
    date,
  };
  Expense.create(newExpense);
  res.status(201).json(newExpense);
}

// Total operational cost per vehicle = Fuel + Maintenance + misc Expenses (per spec 3.7)
function getOperationalCost(req, res) {
  const { vehicleId } = req.params;

  const fuelTotal = FuelLog.getAll()
    .filter(f => f.vehicleId === vehicleId)
    .reduce((sum, f) => sum + (Number(f.cost) || 0), 0);

  const maintenanceTotal = Maintenance.getAll()
    .filter(m => m.vehicleId === vehicleId)
    .reduce((sum, m) => sum + (Number(m.cost) || 0), 0);

  const expenseTotal = Expense.getAll()
    .filter(e => e.vehicleId === vehicleId)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  res.json({
    vehicleId,
    fuelCost: fuelTotal,
    maintenanceCost: maintenanceTotal,
    expenseCost: expenseTotal,
    totalOperationalCost: fuelTotal + maintenanceTotal + expenseTotal,
  });
}

module.exports = { getFuelLogs, createFuelLog, getExpenses, createExpense, getOperationalCost };