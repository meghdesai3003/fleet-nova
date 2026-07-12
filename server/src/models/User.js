const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/users.json');

function getAllUsers() {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

function findByEmail(email) {
  const users = getAllUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

module.exports = { getAllUsers, findByEmail };