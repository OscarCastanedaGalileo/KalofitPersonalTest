'use strict';

const bcrypt = require('bcrypt');
module.exports = {
  async up (queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('systempassword', 10);
    await queryInterface.bulkInsert('Users', [{
      name: 'System Data',
      email: 'system@kalo.fit',
      hashPassword: passwordHash,
      isConfirmed: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'system@kalo.fit' });
  }
};
