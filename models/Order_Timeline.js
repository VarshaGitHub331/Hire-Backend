module.exports = (sequelize, DataTypes) => {
  const Order_Timeline = sequelize.define("Order_Timeline", {
    order_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "orders",
        key: "order_id",
      },
    },
    task_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    task_status: {
      type: DataTypes.ENUM("Pending", "Completed"),
      allowNull: false,
    },
  });
  Order_Timeline.associate = (models) => {
    Order_Timeline.belongsTo(models.Order, {
      foreignKey: "order_id",
    });
  };
  return Order_Timeline;
};
