module.exports = (sequelize, DataTypes) => {
  const Gig_Skills = sequelize.define(
    "Gig_Skills",
    {
      gig_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "Gigs",
          key: "gig_id",
        },
      },
      skill_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "Skills",
          key: "skill_id",
        },
      },
    },
    {
      tableName: "Gig_Skills",
    }
  );
  Gig_Skills.associate = (models) => {
    Gig_Skills.belongsTo(models.Skills, {
      foreignKey: "skill_id",
    });
    Gig_Skills.belongsTo(models.Gigs, {
      foreignKey: "gig_id",
    });
  };
  return Gig_Skills;
};
