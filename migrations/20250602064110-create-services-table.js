'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('services', {
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
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      category: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      illustrationImage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      rating: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      reviewCount: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Enable RLS on services
    await queryInterface.sequelize.query('ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;');

    // Create policy to allow salons to access only their own services
    await queryInterface.sequelize.query(`
      CREATE POLICY "Salons can view their own services" ON "services"
      FOR SELECT
      TO authenticated
      USING ("salonId" = auth.uid());
    `);

    await queryInterface.sequelize.query(`
      CREATE POLICY "Salons can insert their own services" ON "services"
      FOR INSERT
      TO authenticated
      WITH CHECK ("salonId" = auth.uid());
    `);

    await queryInterface.sequelize.query(`
      CREATE POLICY "Salons can update their own services" ON "services"
      FOR UPDATE
      TO authenticated
      USING ("salonId" = auth.uid());
    `);

    await queryInterface.sequelize.query(`
      CREATE POLICY "Salons can delete their own services" ON "services"
      FOR DELETE
      TO authenticated
      USING ("salonId" = auth.uid());
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop policies and disable RLS
    await queryInterface.sequelize.query('DROP POLICY "Salons can view their own services" ON "services";');
    await queryInterface.sequelize.query('DROP POLICY "Salons can insert their own services" ON "services";');
    await queryInterface.sequelize.query('DROP POLICY "Salons can update their own services" ON "services";');
    await queryInterface.sequelize.query('DROP POLICY "Salons can delete their own services" ON "services";');
    await queryInterface.sequelize.query('ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;');
    await queryInterface.dropTable('services');
  }
};
