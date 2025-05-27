'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Tạo enum type mới
    await queryInterface.sequelize.query(`
      ALTER TABLE actions 
      MODIFY COLUMN type ENUM('maintenance', 'repair', 'replacement', 'inspection', 'calibration') NOT NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revert về kiểu STRING
    await queryInterface.sequelize.query(`
      ALTER TABLE actions 
      MODIFY COLUMN type VARCHAR(50) NOT NULL;
    `);
  }
}; 