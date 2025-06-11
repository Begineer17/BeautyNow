const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const UserVoucher = sequelize.define('UserVoucher', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
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
    tableName: 'user_vouchers',
    timestamps: false,
});

User.hasMany(UserVoucher, { foreignKey: 'userId' });
UserVoucher.belongsTo(User, { foreignKey: 'userId' });

module.exports = UserVoucher;