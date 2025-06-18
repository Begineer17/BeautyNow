'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('salons', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      businessLicense: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      licenseStatus: {
        type: Sequelize.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending',
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      otp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      otpExpires: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      reviewCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  // Enable RLS on salons
    await queryInterface.sequelize.query('ALTER TABLE "salons" ENABLE ROW LEVEL SECURITY;');

    // Create policy to allow salons to access only their own profile
    await queryInterface.sequelize.query(`
      CREATE POLICY "Salons can view their own profile" ON "salons"
      FOR SELECT
      TO authenticated
      USING ("id" = auth.uid());
    `);

    await queryInterface.sequelize.query(`
      CREATE POLICY "Salons can insert their own profile" ON "salons"
      FOR INSERT
      TO authenticated
      WITH CHECK ("id" = auth.uid());
    `);

    await queryInterface.sequelize.query(`
      CREATE POLICY "Salons can update their own profile" ON "salons"
      FOR UPDATE
      TO authenticated
      USING ("id" = auth.uid());
    `);

    await queryInterface.sequelize.query(`
      CREATE POLICY "Salons can delete their own profile" ON "salons"
      FOR DELETE
      TO authenticated
      USING ("id" = auth.uid());
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop policies and disable RLS
    await queryInterface.sequelize.query('DROP POLICY "Salons can view their own profile" ON "salons";');
    await queryInterface.sequelize.query('DROP POLICY "Salons can insert their own profile" ON "salons";');
    await queryInterface.sequelize.query('DROP POLICY "Salons can update their own profile" ON "salons";');
    await queryInterface.sequelize.query('DROP POLICY "Salons can delete their own profile" ON "salons";');
    await queryInterface.sequelize.query('ALTER TABLE "salons" DISABLE ROW LEVEL SECURITY;');
    await queryInterface.dropTable('salons');
  }
};