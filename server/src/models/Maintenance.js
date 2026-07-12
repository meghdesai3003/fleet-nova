const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/maintenance.json');

function getAll() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function saveAll(records) {
  fs.writeFileSync(dataPath, JSON.stringify(records, null, 2));
}

function findById(id) {
  return getAll().find(m => m.id === id);
}

function create(record) {
  const records = getAll();
  records.push(record);
  saveAll(records);
  return record;
}

function update(id, updates) {
  const records = getAll();
  const index = records.findIndex(m => m.id === id);
  if (index === -1) return null;
  records[index] = { ...records[index], ...updates };
  saveAll(records);
  return records[index];
}

module.exports = { getAll, findById, create, update };