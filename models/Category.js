module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category", // Model name goes here
    {
      category_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      category_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      tableName: "Category", // Explicitly specify the table name
    }
  );
  Category.associate = (models) => {
    console.log(models);
    Category.hasMany(models.User, {
      foreignKey: "user_id",
    });
    Category.hasMany(models.Skills, {
      foreignKey: "category_id",
    });
  };

  return Category;
};
