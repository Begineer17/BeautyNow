const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Salon = require('./Salon');

const Advertisement = sequelize.define('Advertisement', {
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
    packageType: {
        type: DataTypes.STRING, // Ví dụ: "basic", "premium" hoặc "highlight"
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
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
    isHighlighted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'advertisements',
    timestamps: false,
});

Salon.hasMany(Advertisement, { foreignKey: 'salonId' });
Advertisement.belongsTo(Salon, { foreignKey: 'salonId' });

module.exports = Advertisement;