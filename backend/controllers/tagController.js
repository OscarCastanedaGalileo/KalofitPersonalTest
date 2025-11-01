const { Tag } = require("../models");
const logger = require("../config/logger");

module.exports = {
  // Get all tags for a user
  async getTags(req, res) {
    try {
      const userId = req.user.id;

      const tags = await Tag.findAll({
        where: { userId },
        attributes: ['id', 'name'],
        order: [['name', 'ASC']],
      });

      res.json(tags);
    } catch (error) {
      logger.error(`Error fetching tags: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
