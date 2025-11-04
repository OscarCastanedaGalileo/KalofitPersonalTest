'use strict';

const bcrypt = require('bcrypt');
const { User, Profile } = require('../models');
const { name } = require('../app');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create user
    const user = await User.create({
      name  : 'Admin User',
      email: 'admin@kalo.fit',
      hashPassword: hashedPassword,
      role: 'admin',
      isConfirmed: true,
    });

    // Create profile for the user
    await Profile.create({
      userId: user.id,
      dailyWaterGoal: 3000, // Default water goal
    });
  },

  async down (queryInterface, Sequelize) {
    // Find and delete profile first
    const user = await User.findOne({ where: { email: 'admin@kalo.fit' } });
    if (user) {
      await Profile.destroy({ where: { userId: user.id } });
    }
    // Then delete user
    await User.destroy({ where: { email: 'admin@kalo.fit' } });
  }
};
