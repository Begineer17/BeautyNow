const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Salon = require('./Salon');
const Service = require('./Service');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // userId: {
  //   type: DataTypes.UUID,
  //   allowNull: false,
  //   references: {
  //     model: 'users',
  //     key: 'id',
  //   },
  //   onDelete: 'CASCADE',
  // },
  userName: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  salonId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'salons',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'services',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  images: {
    type: DataTypes.JSON, // lưu mảng URL
    allowNull: true,
  },
  reply: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reported: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'reviews',
  timestamps: false,
});

// User.hasMany(Review, { foreignKey: 'userId' });
// Review.belongsTo(User, { foreignKey: 'userId' });

Salon.hasMany(Review, { foreignKey: 'salonId' });
Review.belongsTo(Salon, { foreignKey: 'salonId' });

Service.hasMany(Review, { foreignKey: 'serviceId' });
Review.belongsTo(Service, { foreignKey: 'serviceId' });

module.exports = Review;
