const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/expenses.json');

function getAll() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function saveAll(expenses) {
  fs.writeFileSync(dataPath, JSON.stringify(expenses, null, 2));
}

function create(expense) {
  const expenses = getAll();
  expenses.push(expense);
  saveAll(expenses);
  return expense;
}

module.exports = { getAll, create };