'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Thêm trường resolution_details
    await queryInterface.addColumn('failures', 'resolution_details', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Xóa trường resolved_by_action_id
    await queryInterface.removeColumn('failures', 'resolved_by_action_id');
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa trường resolution_details
    await queryInterface.removeColumn('failures', 'resolution_details');

    // Thêm lại trường resolved_by_action_id
    await queryInterface.addColumn('failures', 'resolved_by_action_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
}; 