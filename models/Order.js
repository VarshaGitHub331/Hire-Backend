module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define("Order", {
    order_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    creator: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "user_id",
      },
    },
    acceptor: {
      type: DataTypes.INTEGER,
      references: {
        model: "User",
        key: "user_id",
      },
    },
    job_posting_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Job_Postings", // Reference the Job_Postings table
        key: "job_id", // Reference the primary key in Job_Postings table
      },
    },
    gig_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Gigs",
        key: "gig_id",
      },
    },
    status: {
      type: DataTypes.ENUM(
        "created",
        "accepted",
        "progress",
        "complete",
        "rejected"
      ),
      allowNull: false,
    },
    payable: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    package: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    payment: {
      type: DataTypes.TEXT,
      allowNull: true,
      default: "pending",
    },
  });
  Order.associate = (models) => {
    Order.belongsTo(models.User, {
      foreignKey: "creator",
      as: "client",
      constraints: true,
    });
    Order.belongsTo(models.User, {
      foreignKey: "acceptor",
      as: "helper",
      constraints: true,
    });
    Order.belongsTo(models.Job_Postings, {
      foreignKey: "job_posting_id",
      constraints: true,
    });
  };
  return Order;
};
