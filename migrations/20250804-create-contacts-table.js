'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contacts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      salonId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'salons',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      customerName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      customerPhone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed'),
        defaultValue: 'pending',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Enable RLS (nếu áp dụng RLS cho bảng này)
    await queryInterface.sequelize.query('ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;');

    await queryInterface.sequelize.query(`
      CREATE POLICY "Salons can view their contacts" ON "contacts"
      FOR SELECT
      TO authenticated
      USING ("salonId" = auth.uid());
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP POLICY "Salons can view their contacts" ON "contacts";');
    await queryInterface.sequelize.query('ALTER TABLE "contacts" DISABLE ROW LEVEL SECURITY;');
    await queryInterface.dropTable('contacts');
  }
};
