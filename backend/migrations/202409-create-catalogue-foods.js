'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('catalogue_foods', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      source: {
        type: Sequelize.STRING(16),
        allowNull: false,
        defaultValue: 'FDC',
      },
      fdc_id: {
        type: Sequelize.INTEGER,
        unique: true,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      kcal_per_100g: {
        type: Sequelize.DECIMAL,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Índice GIN para búsqueda textual en español
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_catalogue_foods_name
      ON catalogue_foods USING gin (to_tsvector('spanish', name));
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('catalogue_foods');
  },
};