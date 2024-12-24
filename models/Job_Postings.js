module.exports = (sequelize, DataTypes) => {
  const Job_Postings = sequelize.define(
    "Job_Postings",
    {
      job_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // This field can be null (if referencing Client)
        references: {
          model: "Client", // Assuming the reference is to Client model
          key: "user_id",
        },
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      duration: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("True", "False"),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      tableName: "Job_Postings",
    }
  );

  Job_Postings.associate = (models) => {
    // Assuming 'user_id' refers to 'Client' model
    Job_Postings.belongsTo(models.Client, {
      foreignKey: "user_id",
    });

    // Job-Category and Job-Skill associations
    Job_Postings.belongsToMany(models.Skills, {
      through: "job_skills",
      foreignKey: "job_id",
    });
    Job_Postings.belongsToMany(models.Category, {
      through: "job_categories",
      foreignKey: "job_id",
    });

    // Associations with 'Order' and 'Bids' using 'job_id' foreign key
    Job_Postings.hasOne(models.Order, {
      foreignKey: "job_id", // Foreign key in Orders table
      as: "order",
    });

    Job_Postings.hasMany(models.Bids, {
      foreignKey: "job_id", // Foreign key in Bids table
      as: "bid",
    });
  };

  return Job_Postings;
};
