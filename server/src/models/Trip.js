const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/trips.json');

function getAll() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function saveAll(trips) {
  fs.writeFileSync(dataPath, JSON.stringify(trips, null, 2));
}

function findById(id) {
  return getAll().find(t => t.id === id);
}

function create(trip) {
  const trips = getAll();
  trips.push(trip);
  saveAll(trips);
  return trip;
}

function update(id, updates) {
  const trips = getAll();
  const index = trips.findIndex(t => t.id === id);
  if (index === -1) return null;
  trips[index] = { ...trips[index], ...updates };
  saveAll(trips);
  return trips[index];
}

module.exports = { getAll, findById, create, update };