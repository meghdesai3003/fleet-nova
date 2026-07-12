const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/fuelLogs.json');

function getAll() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function saveAll(logs) {
  fs.writeFileSync(dataPath, JSON.stringify(logs, null, 2));
}

function create(log) {
  const logs = getAll();
  logs.push(log);
  saveAll(logs);
  return log;
}

module.exports = { getAll, create };