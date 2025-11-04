'use strict';

const bcrypt = require('bcrypt');
const { User, Profile } = require('../models');

module.exports = {
  async up (queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('systempassword', 10);

    // Create user
    const user = await User.create({
      name: 'System Data',
      email: 'system@kalo.fit',
      hashPassword: passwordHash,
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
    const user = await User.findOne({ where: { email: 'system@kalo.fit' } });
    if (user) {
      await Profile.destroy({ where: { userId: user.id } });
    }
    // Then delete user
    await User.destroy({ where: { email: 'system@kalo.fit' } });
  }
};
