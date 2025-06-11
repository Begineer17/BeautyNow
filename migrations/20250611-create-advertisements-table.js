'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('advertisements', {
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
                    key: 'id'
                },
                onDelete: 'CASCADE',
            },
            packageType: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            startTime: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            endTime: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM('pending', 'confirmed', 'cancelled'),
                allowNull: false,
                defaultValue: 'pending',
            },
            isHighlighted: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        // Enable RLS và tạo các policy cho user_vouchers
        await queryInterface.sequelize.query('ALTER TABLE "advertisements" ENABLE ROW LEVEL SECURITY;');

        await queryInterface.sequelize.query(`
            CREATE POLICY "Salons can view their own advertisements" ON "advertisements"
            FOR SELECT
            TO authenticated
            USING ("salonId" = auth.uid());
        `);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('advertisements');
    }
};