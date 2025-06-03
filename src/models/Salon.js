const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// const Salon_tmp = sequelize.define('Salon_tmp', {
//   id: {
//     type: DataTypes.UUID,
//     defaultValue: DataTypes.UUIDV4,
//     primaryKey: true,
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   businessLicense: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   licenseStatus: {
//     type: DataTypes.ENUM('pending', 'verified', 'rejected'),
//     defaultValue: 'pending',
//   },
//   // isVerified: {
//   //   type: DataTypes.BOOLEAN,
//   //   defaultValue: false,
//   // },
//   otp: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   otpExpires: {
//     type: DataTypes.DATE,
//     allowNull: true,
//   },
//   createdAt: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW,
//   },
// }, {
//   tableName: 'salons_tmp',
//   timestamps: false,
// });

// module.exports = Salon_tmp;

const Salon = sequelize.define('Salon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  businessLicense: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  licenseStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending',
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otpExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'salons',
  timestamps: false,
});

module.exports = Salon;