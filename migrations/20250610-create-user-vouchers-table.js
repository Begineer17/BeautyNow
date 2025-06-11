'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user_vouchers', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'CASCADE',
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            discountPercentage: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            comboDetails: {
                type: Sequelize.JSON,
                allowNull: true,
            },
            startDate: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            endDate: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });
        // Enable RLS và tạo các policy cho user_vouchers
        await queryInterface.sequelize.query('ALTER TABLE "user_vouchers" ENABLE ROW LEVEL SECURITY;');

        await queryInterface.sequelize.query(`
            CREATE POLICY "Users can view their own vouchers" ON "user_vouchers"
            FOR SELECT
            TO authenticated
            USING ("userId" = auth.uid());
        `);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query('DROP POLICY "Users can view their own vouchers" ON "user_vouchers";');
        await queryInterface.sequelize.query('ALTER TABLE "user_vouchers" DISABLE ROW LEVEL SECURITY;');
        await queryInterface.dropTable('user_vouchers');
    }
};