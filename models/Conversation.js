module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define(
    "Conversation",
    {
      conversation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      buyer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Client",
          key: "user_id",
        },
      },
      seller_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Freelancer",
          key: "user_id",
        },
      },
    },
    {
      timestamps: true,
      tableName: "Conversation",
    }
  );
  Conversation.associate = (models) => {
    Conversation.belongsTo(models.Freelancer, {
      foreignKey: "seller_id",
      constraints: true,
    });
    Conversation.belongsTo(models.Client, {
      foreignKey: "buyer_id",
      constraints: true,
    });
  };
  return Conversation;
};
