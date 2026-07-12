const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/drivers.json');

function getAll() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function saveAll(drivers) {
  fs.writeFileSync(dataPath, JSON.stringify(drivers, null, 2));
}

function findById(id) {
  return getAll().find(d => d.id === id);
}

function create(driver) {
  const drivers = getAll();
  drivers.push(driver);
  saveAll(drivers);
  return driver;
}

function update(id, updates) {
  const drivers = getAll();
  const index = drivers.findIndex(d => d.id === id);
  if (index === -1) return null;
  drivers[index] = { ...drivers[index], ...updates };
  saveAll(drivers);
  return drivers[index];
}

function remove(id) {
  const drivers = getAll();
  const filtered = drivers.filter(d => d.id !== id);
  saveAll(filtered);
  return filtered.length !== drivers.length;
}

module.exports = { getAll, findById, create, update, remove };