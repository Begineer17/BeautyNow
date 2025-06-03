'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('salon_profiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      salonId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'salons',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      portfolio: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Enable RLS on salon_profiles
    await queryInterface.sequelize.query('ALTER TABLE "salon_profiles" ENABLE ROW LEVEL SECURITY;');

    // Create policy to allow salons to access only their own profile
    await queryInterface.sequelize.query(`
      CREATE POLICY "Salons can view their own profile" ON "salon_profiles"
      FOR SELECT
      TO authenticated
      USING ("salonId" = auth.uid());
    `);

    await queryInterface.sequelize.query(`
      CREATE POLICY "Salons can insert their own profile" ON "salon_profiles"
      FOR INSERT
      TO authenticated
      WITH CHECK ("salonId" = auth.uid());
    `);

    await queryInterface.sequelize.query(`
      CREATE POLICY "Salons can update their own profile" ON "salon_profiles"
      FOR UPDATE
      TO authenticated
      USING ("salonId" = auth.uid());
    `);

    await queryInterface.sequelize.query(`
      CREATE POLICY "Salons can delete their own profile" ON "salon_profiles"
      FOR DELETE
      TO authenticated
      USING ("salonId" = auth.uid());
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop policies and disable RLS
    await queryInterface.sequelize.query('DROP POLICY "Salons can view their own profile" ON "salon_profiles";');
    await queryInterface.sequelize.query('DROP POLICY "Salons can insert their own profile" ON "salon_profiles";');
    await queryInterface.sequelize.query('DROP POLICY "Salons can update their own profile" ON "salon_profiles";');
    await queryInterface.sequelize.query('DROP POLICY "Salons can delete their own profile" ON "salon_profiles";');
    await queryInterface.sequelize.query('ALTER TABLE "salon_profiles" DISABLE ROW LEVEL SECURITY;');
    await queryInterface.dropTable('salon_profiles');
  }
};