const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const FuelLog = require('../models/FuelLog');
const Maintenance = require('../models/Maintenance');

function getReports(req, res) {
  const vehicles = Vehicle.getAll();
  const trips = Trip.getAll();
  const fuelLogs = FuelLog.getAll();
  const maintenanceRecords = Maintenance.getAll();

  const report = vehicles.map(vehicle => {
    const vehicleTrips = trips.filter(t => t.vehicleId === vehicle.id && t.status === 'Completed');
    const totalDistance = vehicleTrips.reduce((sum, t) => sum + (t.plannedDistance || 0), 0);
    const totalFuelConsumed = vehicleTrips.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0);

    const fuelCost = fuelLogs
      .filter(f => f.vehicleId === vehicle.id)
      .reduce((sum, f) => sum + f.cost, 0);

    const maintenanceCost = maintenanceRecords
      .filter(m => m.vehicleId === vehicle.id)
      .reduce((sum, m) => sum + m.cost, 0);

    const operationalCost = fuelCost + maintenanceCost;
    const fuelEfficiency = totalFuelConsumed > 0 ? (totalDistance / totalFuelConsumed).toFixed(2) : null;

    // Revenue = freight billed on completed trips for this vehicle
    const revenue = vehicleTrips.reduce((sum, t) => sum + (t.freightRevenue || 0), 0);
    const roi = vehicle.acquisitionCost > 0
      ? ((revenue - operationalCost) / vehicle.acquisitionCost).toFixed(4)
      : null;

    return {
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      fuelEfficiency,
      revenue,
      operationalCost,
      roi,
    };
  });

  // Fleet utilization: % of vehicles currently On Trip
  const onTripCount = vehicles.filter(v => v.status === 'On Trip').length;
  const fleetUtilization = vehicles.length > 0 ? ((onTripCount / vehicles.length) * 100).toFixed(1) : 0;

  res.json({ vehicles: report, fleetUtilization: `${fleetUtilization}%` });
}

module.exports = { getReports };