'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_profiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      faceImage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Enable RLS on user_profiles
    await queryInterface.sequelize.query('ALTER TABLE "user_profiles" ENABLE ROW LEVEL SECURITY;');

    // Create policy to allow users to access only their own profile
    await queryInterface.sequelize.query(`
      CREATE POLICY "Users can view their own profile" ON "user_profiles"
      FOR SELECT
      TO authenticated
      USING ("userId" = auth.uid());
    `);

    await queryInterface.sequelize.query(`
      CREATE POLICY "Users can insert their own profile" ON "user_profiles"
      FOR INSERT
      TO authenticated
      WITH CHECK ("userId" = auth.uid());
    `);

    await queryInterface.sequelize.query(`
      CREATE POLICY "Users can update their own profile" ON "user_profiles"
      FOR UPDATE
      TO authenticated
      USING ("userId" = auth.uid());
    `);

    // Note: Delete policy can be restricted further if needed, here allowing authenticated users
    await queryInterface.sequelize.query(`
      CREATE POLICY "Users can delete their own profile" ON "user_profiles"
      FOR DELETE
      TO authenticated
      USING ("userId" = auth.uid());
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop policies and disable RLS
    await queryInterface.sequelize.query('DROP POLICY "Users can view their own profile" ON "user_profiles";');
    await queryInterface.sequelize.query('DROP POLICY "Users can insert their own profile" ON "user_profiles";');
    await queryInterface.sequelize.query('DROP POLICY "Users can update their own profile" ON "user_profiles";');
    await queryInterface.sequelize.query('DROP POLICY "Users can delete their own profile" ON "user_profiles";');
    await queryInterface.sequelize.query('ALTER TABLE "user_profiles" DISABLE ROW LEVEL SECURITY;');
    await queryInterface.dropTable('user_profiles');
  }
};