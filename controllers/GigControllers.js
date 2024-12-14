const express = require("express");
const sequelize = require("sequelize");
const {
  Gigs,
  Freelancer_Gigs,
  Gig_Categories,
  Gig_Skills,
  Category,
  Skills,
} = require("../utils/InitializeModels");

const FetchGigs = async (req, res, next) => {
  console.log(req.query);
  const { user_id, page, limit } = req.query;
  const results = []; // Extract user_id from the request body
  const pageNumber = parseInt(page) || 1; // Default to 1 if no page is provided
  const limitNumber = parseInt(limit) || 3; // Default to 3 if no limit is provided

  // Calculate the offset for pagination: (pageNumber - 1) * limit
  const offset = (pageNumber - 1) * limitNumber;

  try {
    const gigResults = await Gigs.findAll({
      include: [
        {
          model: Freelancer_Gigs,
          attributes: [],
          where: {
            user_id: user_id,
          },
        },
        {
          model: Gig_Categories,
          attributes: ["category_id"],
        },
      ],
      raw: true,
      offset: offset, // Apply offset for pagination
      limit: limitNumber, // Apply limit
    });
    console.log(gigResults);
    for (let gig of gigResults) {
      const skillResult = await Gigs.findAll({
        include: [
          {
            model: Skills,
            attributes: [
              [
                sequelize.fn(
                  "GROUP_CONCAT",
                  sequelize.col("Skills.skill_name")
                ),
                "skill_names",
              ],
            ],
            through: {
              attributes: [], // No additional attributes from the join table
            },
          },
        ],
        where: { gig_id: gig.gig_id },
        raw: true,
        group: ["Gigs.gig_id"], // Ensure grouping by gig_id
        attributes: [],
      });
      const categoryName = await Category.findOne({
        where: { category_id: gig["Gig_Category.category_id"] },
        attributes: ["category_name"],
        raw: true,
      });
      console.log(skillResult);
      console.log(categoryName.category_name);
      gig.category_name = categoryName.category_name;
      gig.skills_names = skillResult[0]["Skills.skill_names"];
      results.push(gig);
    }
    console.log(results);
    res.status(200).json(results);
  } catch (e) {
    next(e); // Pass any error to the next middleware
  }
};

module.exports = { FetchGigs };
