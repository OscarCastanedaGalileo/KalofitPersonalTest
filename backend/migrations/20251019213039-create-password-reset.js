'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PasswordResets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      codeHash: {
        type: Sequelize.STRING
      },
      expiresAt: {
        type: Sequelize.DATE
      },
      attempts: {
        type: Sequelize.INTEGER
      },
      consumed: {
        type: Sequelize.BOOLEAN
      },
      ip: {
        type: Sequelize.STRING
      },
      userAgent: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex('PasswordResets', ['userId']);
    await queryInterface.addIndex('PasswordResets', ['expiresAt']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PasswordResets');
  }
};
