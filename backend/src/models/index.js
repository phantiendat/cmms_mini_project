const sequelize = require('../config/db.config');
const { DataTypes } = require('sequelize');

// Import models
const User = require('./user.model')(sequelize, DataTypes);
const Asset = require('./asset.model')(sequelize, DataTypes);
const Action = require('./action.model')(sequelize, DataTypes);
const Failure = require('./failure.model')(sequelize, DataTypes);
const Document = require('./document.model')(sequelize, DataTypes);
const CustomField = require('./customField.model')(sequelize, DataTypes);

// Define associations
Asset.hasMany(Document, { foreignKey: 'asset_id' });
Document.belongsTo(Asset, { foreignKey: 'asset_id' });

Asset.hasMany(Action, { foreignKey: 'asset_id' });
Action.belongsTo(Asset, { foreignKey: 'asset_id' });

Asset.hasMany(Failure, { foreignKey: 'asset_id' });
Failure.belongsTo(Asset, { foreignKey: 'asset_id' });

// Export models
module.exports = {
  sequelize,
  User,
  Asset,
  Action,
  Failure,
  Document,
  CustomField
};
