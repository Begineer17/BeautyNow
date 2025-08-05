const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Salon = require('./Salon');

const Contact = sequelize.define('Contact', {
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
    customerName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    customerPhone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed'),
        defaultValue: 'pending',
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'contacts',
    timestamps: false,
});

Salon.hasMany(Contact, { foreignKey: 'salonId' });
Contact.belongsTo(Salon, { foreignKey: 'salonId' });

module.exports = Contact;