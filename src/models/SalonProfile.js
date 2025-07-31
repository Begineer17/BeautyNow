const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Salon = require('./Salon');
const Portfolio = require('./Portfolio');

const SalonProfile = sequelize.define('SalonProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true,
  },
  salonId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'salons',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  businessType: {
    type: DataTypes.ENUM('1', '2', '3'), // Should use string values to match Postgres ENUM
    allowNull: false,
    defaultValue: '1', // Default to '1' as string
  },

  portfolio: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'portfolios',
      key: 'id',
    },
  },
  priceRange: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  openTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalStaff: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tag: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'salon_profiles',
  timestamps: false,
});

// Associations
Salon.hasOne(SalonProfile, { foreignKey: 'salonId' });
SalonProfile.belongsTo(Salon, { foreignKey: 'salonId' });

Portfolio.hasOne(SalonProfile, { foreignKey: 'portfolio' });
SalonProfile.belongsTo(Portfolio, { foreignKey: 'portfolio' });

module.exports = SalonProfile;
