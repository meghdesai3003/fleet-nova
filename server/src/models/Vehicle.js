const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/vehicles.json');

function getAll() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function saveAll(vehicles) {
  fs.writeFileSync(dataPath, JSON.stringify(vehicles, null, 2));
}

function findById(id) {
  return getAll().find(v => v.id === id);
}

function create(vehicle) {
  const vehicles = getAll();
  vehicles.push(vehicle);
  saveAll(vehicles);
  return vehicle;
}

function update(id, updates) {
  const vehicles = getAll();
  const index = vehicles.findIndex(v => v.id === id);
  if (index === -1) return null;
  vehicles[index] = { ...vehicles[index], ...updates };
  saveAll(vehicles);
  return vehicles[index];
}

function remove(id) {
  const vehicles = getAll();
  const filtered = vehicles.filter(v => v.id !== id);
  saveAll(filtered);
  return filtered.length !== vehicles.length;
}

module.exports = { getAll, findById, create, update, remove };