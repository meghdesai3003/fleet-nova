const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

function isLicenseExpired(driver) {
  const today = new Date();
  const expiry = new Date(driver.licenseExpiryDate);
  return expiry < today;
}

function validateTripCreation({ vehicleId, driverId, cargoWeight }) {
  const vehicle = Vehicle.findById(vehicleId);
  const driver = Driver.findById(driverId);

  if (!vehicle) return { valid: false, message: 'Vehicle not found' };
  if (!driver) return { valid: false, message: 'Driver not found' };

  if (vehicle.status === 'Retired' || vehicle.status === 'In Shop') {
    return { valid: false, message: `Vehicle is ${vehicle.status} and cannot be dispatched` };
  }

  if (vehicle.status === 'On Trip') {
    return { valid: false, message: 'Vehicle is already on a trip' };
  }

  if (driver.status === 'Suspended') {
    return { valid: false, message: 'Driver is suspended and cannot be assigned' };
  }

  if (isLicenseExpired(driver)) {
    return { valid: false, message: 'Driver license has expired' };
  }

  if (driver.status === 'On Trip') {
    return { valid: false, message: 'Driver is already on a trip' };
  }

  if (cargoWeight > vehicle.maxLoadCapacity) {
    return {
      valid: false,
      message: `Cargo weight (${cargoWeight}kg) exceeds vehicle max load capacity (${vehicle.maxLoadCapacity}kg)`,
    };
  }

  return { valid: true };
}

function dispatchTrip(vehicleId, driverId) {
  Vehicle.update(vehicleId, { status: 'On Trip' });
  Driver.update(driverId, { status: 'On Trip' });
}

function completeTrip(vehicleId, driverId, finalOdometer) {
  const updates = { status: 'Available' };
  if (finalOdometer !== undefined) {
    Vehicle.update(vehicleId, { ...updates, odometer: finalOdometer });
  } else {
    Vehicle.update(vehicleId, updates);
  }
  Driver.update(driverId, { status: 'Available' });
}

function cancelTrip(vehicleId, driverId) {
  Vehicle.update(vehicleId, { status: 'Available' });
  Driver.update(driverId, { status: 'Available' });
}

module.exports = {
  validateTripCreation,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  isLicenseExpired,
};