const { Profile, User } = require("../models");
const logger = require("../config/logger");

module.exports = {
  // Get user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const profile = await Profile.findOne({
        where: { userId },
        include: [
          {
            model: User,
            as: "user",
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      logger.error(`Error fetching profile: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Update user profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const {
        name,
        dailyKcalGoal,
        dailyWaterGoal,
        birthDate,
        weight,
        height,
        gender,
        activityLevel,
        photo
      } = req.body;

      // Update User name if provided
      if (name) {
        await User.update(
          { name },
          { where: { id: userId } }
        );
      }

      // Update or create Profile
      let profile = await Profile.findOne({ where: { userId } });

      if (profile) {
        // Update existing profile
        await profile.update({
          dailyKcalGoal: dailyKcalGoal || profile.dailyKcalGoal,
          dailyWaterGoal: dailyWaterGoal || profile.dailyWaterGoal || 3000,
          birthDate: birthDate || profile.birthDate,
          weight: weight || profile.weight,
          height: height || profile.height,
          gender: gender || profile.gender,
          activityLevel: activityLevel || profile.activityLevel,
          photo: photo || profile.photo,
        });
      } else {
        // Create new profile
        profile = await Profile.create({
          userId,
          dailyKcalGoal: dailyKcalGoal || null,
          dailyWaterGoal: dailyWaterGoal || 3000,
          birthDate: birthDate || null,
          weight: weight || null,
          height: height || null,
          gender: gender || null,
          activityLevel: activityLevel || null,
          photo: photo || null,
        });
      }

      // Fetch updated profile with user data
      const updatedProfile = await Profile.findOne({
        where: { userId },
        include: [
          {
            model: User,
            as: "user",
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      res.json(updatedProfile);
    } catch (error) {
      logger.error(`Error updating profile: ${error.message}`);
      const pg = error?.parent || {};
      res.status(400).json({
        message: error.message,
        code: pg.code,
        detail: pg.detail,
        constraint: pg.constraint,
      });
    }
  },
};
