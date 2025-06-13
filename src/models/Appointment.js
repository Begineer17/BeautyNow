const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Salon = require('./Salon');
const User = require('./User');
const Service = require('./Service');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  salonId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
    defaultValue: 'pending',
  },
  googleCalendarEventId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'appointments',
  timestamps: false,
});

Salon.hasMany(Appointment, { foreignKey: 'salonId' });
Appointment.belongsTo(Salon, { foreignKey: 'salonId' });

User.hasMany(Appointment, { foreignKey: 'customerId' });
Appointment.belongsTo(User, { foreignKey: 'customerId' });

Service.hasMany(Appointment, { foreignKey: 'serviceId' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId' });

module.exports = Appointment;
