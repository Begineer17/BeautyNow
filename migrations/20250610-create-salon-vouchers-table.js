'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('salon_vouchers', {
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
        // Enable RLS và chính sách cho salon_vouchers
        await queryInterface.sequelize.query('ALTER TABLE "salon_vouchers" ENABLE ROW LEVEL SECURITY;');
        
        await queryInterface.sequelize.query(`
            CREATE POLICY "Salons can view their own vouchers" ON "salon_vouchers"
            FOR SELECT
            TO authenticated
            USING ("salonId" = auth.uid());
        `);
        await queryInterface.sequelize.query(`
            CREATE POLICY "Salons can insert their own vouchers" ON "salon_vouchers"
            FOR INSERT
            TO authenticated
            WITH CHECK ("salonId" = auth.uid());
        `);
        await queryInterface.sequelize.query(`
            CREATE POLICY "Salons can update their own vouchers" ON "salon_vouchers"
            FOR UPDATE
            TO authenticated
            USING ("salonId" = auth.uid());
        `);
        await queryInterface.sequelize.query(`
            CREATE POLICY "Salons can delete their own vouchers" ON "salon_vouchers"
            FOR DELETE
            TO authenticated
            USING ("salonId" = auth.uid());
        `);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query('DROP POLICY "Salons can delete their own vouchers" ON "salon_vouchers";');
        await queryInterface.sequelize.query('DROP POLICY "Salons can update their own vouchers" ON "salon_vouchers";');
        await queryInterface.sequelize.query('DROP POLICY "Salons can insert their own vouchers" ON "salon_vouchers";');
        await queryInterface.sequelize.query('DROP POLICY "Salons can view their own vouchers" ON "salon_vouchers";');
        await queryInterface.sequelize.query('ALTER TABLE "salon_vouchers" DISABLE ROW LEVEL SECURITY;');
        await queryInterface.dropTable('salon_vouchers');
    }
};