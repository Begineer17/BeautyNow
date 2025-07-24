'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      // userId: {
      //   type: Sequelize.UUID,
      //   allowNull: false,
      //   references: {
      //     model: 'users',
      //     key: 'id',
      //   },
      //   onDelete: 'CASCADE',
      // },
      userName: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      salonId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'salons',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      serviceId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'services',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      rating: {
        type: Sequelize.INTEGER, // từ 1 đến 5
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      images: {
        type: Sequelize.JSON, // lưu mảng URL
        allowNull: true,
      },
      reply: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reported: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Enable RLS nếu cần thiết
    await queryInterface.sequelize.query('ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;');
    // Thêm chính sách RLS cho cập nhật (update) review của chính user đó

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('ALTER TABLE "reviews" DISABLE ROW LEVEL SECURITY;');
    await queryInterface.dropTable('reviews');
  }
};