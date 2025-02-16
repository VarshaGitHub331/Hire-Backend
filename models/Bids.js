const { createOrderAndSendMail } = require("../utils/Mail.js");
const sequelize = require("../utils/Connection.js");
const { DataTypes } = require("sequelize");
const Job_Postings = require("../models/Job_Postings.js")(sequelize, DataTypes);
const Order = require("../models/Order.js")(sequelize, DataTypes);
const User = require("../models/User.js")(sequelize, DataTypes);
module.exports = (sequelize, DataTypes) => {
  const Bids = sequelize.define("Bids", {
    bidId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        // Corrected from 'refrences' to 'references'
        model: "Client",
        key: "user_id",
      },
    },
    job_posting_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Job_Postings",
        key: "job_id",
      },
    },
    bidder_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        // Corrected from 'refrences' to 'references'
        model: "Applicants",
        key: "applicant_id",
      },
    },
    bid_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bid_details: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    bid_status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      allowNull: false,
    },
    estimated_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Bids.associate = (models) => {
    Bids.belongsTo(models.Job_Postings, {
      foreignKey: "job_posting_id", // Ensure this matches the model field
      constraints: true,
    });
    Bids.belongsTo(models.Applicants, {
      foreignKey: "bidder_id",
      targetKey: "applicant_id",
      constraints: true,
    });
    Bids.belongsTo(models.Client, {
      foreignKey: "client_id",
      constraints: true,
    });
  };

  return Bids;
};
