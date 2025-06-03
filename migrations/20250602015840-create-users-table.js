'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
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
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  // Enable RLS on users
    await queryInterface.sequelize.query('ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;');

    // Create policy to allow users to access only their own profile
    await queryInterface.sequelize.query(`
      CREATE POLICY "Users can view their own profile" ON "users"
      FOR SELECT
      TO authenticated
      USING ("id" = auth.uid());
    `);

    await queryInterface.sequelize.query(`
      CREATE POLICY "Users can insert their own profile" ON "users"
      FOR INSERT
      TO authenticated
      WITH CHECK ("id" = auth.uid());
    `);

    await queryInterface.sequelize.query(`
      CREATE POLICY "Users can update their own profile" ON "users"
      FOR UPDATE
      TO authenticated
      USING ("id" = auth.uid());
    `);

    // Note: Delete policy can be restricted further if needed, here allowing authenticated users
    await queryInterface.sequelize.query(`
      CREATE POLICY "Users can delete their own profile" ON "users"
      FOR DELETE
      TO authenticated
      USING ("id" = auth.uid());
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop policies and disable RLS
    await queryInterface.sequelize.query('DROP POLICY "Users can view their own profile" ON "users";');
    await queryInterface.sequelize.query('DROP POLICY "Users can insert their own profile" ON "users";');
    await queryInterface.sequelize.query('DROP POLICY "Users can update their own profile" ON "users";');
    await queryInterface.sequelize.query('DROP POLICY "Users can delete their own profile" ON "users";');
    await queryInterface.sequelize.query('ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;');
    await queryInterface.dropTable('users');
  }
};