'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('license_verification_history', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      salonId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'salons',
          key: 'id',
        },
      },
      adminId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'verified', 'rejected'),
        allowNull: false,
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

     // Enable RLS 
    await queryInterface.sequelize.query('ALTER TABLE "license_verification_history" ENABLE ROW LEVEL SECURITY;');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('ALTER TABLE "license_verification_history" DISABLE ROW LEVEL SECURITY;');
    await queryInterface.dropTable('license_verification_history');
  }
};