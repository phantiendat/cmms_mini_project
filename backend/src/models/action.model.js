module.exports = (sequelize, DataTypes) => {
  const Action = sequelize.define('Action', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    asset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Assets',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('maintenance', 'repair', 'replacement', 'inspection', 'calibration'),
      allowNull: false
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium',
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM("Planned", "In Progress", "Completed", "Cancelled", "On Hold"),
      allowNull: false,
      defaultValue: "Planned"
    },
    performed_by: {
      type: DataTypes.STRING
    },
    performed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false
    },
    custom_fields: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'actions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Action.associate = function(models) {
    Action.belongsTo(models.Asset, {
      foreignKey: 'asset_id',
      as: 'Asset'
    });
  };

  return Action;
};
