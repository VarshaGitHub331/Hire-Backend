module.exports = (sequelize, DataTypes) => {
  const Gigs = sequelize.define("Gigs", {
    gig_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    budget: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    picture: {
      type: DataTypes.JSON, // Store array as JSON
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    revisions: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    features: {
      type: DataTypes.JSON, // Store array as JSON
      allowNull: false,
    },
    standard_budget: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    advanced_budget: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    standard_features: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    advanced_features: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  });

  Gigs.associate = (models) => {
    Gigs.hasOne(models.Gig_Categories, {
      foreignKey: "gig_id",
    });
    Gigs.belongsToMany(models.Skills, {
      through: "Gig_Skills",
      foreignKey: "gig_id",
    });
    Gigs.hasOne(models.Freelancer_Gigs, {
      foreignKey: "gig_id",
    });
  };

  return Gigs;
};
