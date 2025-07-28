const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Portfolio = sequelize.define('Portfolio', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true,
  },
  representative_images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  gallery_images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'portfolios',
  timestamps: false,
});

module.exports = Portfolio;
