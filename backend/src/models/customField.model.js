module.exports = (sequelize, DataTypes) => {
  const CustomField = sequelize.define('CustomField', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    entity_type: {
      type: DataTypes.ENUM('asset', 'action', 'failure'),
      allowNull: false
    },
    field_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    field_type: {
      type: DataTypes.ENUM('text', 'number', 'date', 'select', 'boolean'),
      allowNull: false
    },
    required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    options: {
      type: DataTypes.JSON
    }
  }, {
    tableName: 'custom_fields',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return CustomField;
};
