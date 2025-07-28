const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Salon = require('./Salon');

const SalonVoucher = sequelize.define('SalonVoucher', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    salonId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'salons', key: 'id' },
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    discountPercentage: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    comboDetails: {
        type: DataTypes.JSON, // thông tin combo: sản phẩm/dịch vụ và giá ưu đãi
        allowNull: true,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'salon_vouchers',
    timestamps: false,
});

Salon.hasMany(SalonVoucher, { foreignKey: 'salonId' });
SalonVoucher.belongsTo(Salon, { foreignKey: 'salonId' });

module.exports = SalonVoucher;