module.exports = (sequelize, DataTypes) => {
  const Failure = sequelize.define('Failure', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    asset_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'Open'
    },
    detected_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    resolved_at: {
      type: DataTypes.DATE
    },
    resolution_details: {
      type: DataTypes.TEXT
    },
    resolved_by: {
      type: DataTypes.STRING
    },
    reported_by: {
      type: DataTypes.STRING
    },
    custom_fields: {
      type: DataTypes.JSON
    }
  }, {
    tableName: 'failures',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Failure;
};
