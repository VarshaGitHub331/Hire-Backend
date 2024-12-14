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
      type: DataTypes.STRING,
      allowNull: false,
    },
    picture: {
      type: DataTypes.JSON, // Store array as JSON
      allowNull: false,
    },
    features: {
      type: DataTypes.JSON, // Store array as JSON
      allowNull: false,
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
