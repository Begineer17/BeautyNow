const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Salon = require('./Salon');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  salonId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'salons',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  illustrationImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'services',
  timestamps: false,
});

Salon.hasMany(Service, { foreignKey: 'salonId' });
Service.belongsTo(Salon, { foreignKey: 'salonId' });

module.exports = Service;
