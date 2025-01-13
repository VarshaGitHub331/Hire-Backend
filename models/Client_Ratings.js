module.exports = (Sequelize, DataTypes) => {
  const Client_Ratings = Sequelize.define(
    "Client_Ratings", // Model name
    {
      client_id: {
        type: DataTypes.INTEGER,
        references: {
          // Fixed typo here
          model: "Client",
          key: "user_id",
        },
        primaryKey: true,
        allowNull: false,
      },
      total_rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      rating_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      average_rating: {
        type: DataTypes.VIRTUAL(DataTypes.DECIMAL(4, 2)),
        get() {
          const total = this.getDataValue("total_rating") || 0;
          const count = this.getDataValue("rating_count") || 1; // Avoid division by zero
          return (total / count).toFixed(2);
        },
      },
      last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "client_ratings",
    }
  );

  return Client_Ratings;
};
