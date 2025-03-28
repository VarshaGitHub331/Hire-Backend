const express = require("express");
const sequelize = require("sequelize");
const {
  Gigs,
  Freelancer_Gigs,
  Gig_Categories,
  Gig_Skills,
  Category,
  Skills,
  Freelancer_Ratings,

  User,
  Freelancer,
} = require("../utils/InitializeModels");
const { Sequelize } = require("../models");
const { cacher } = require("../utils/redisClient");
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
const EditGig = async (req, res, next) => {
  const { gig_id, gigTitle, budget, category, skillDetails, features } =
    req.body;
  console.log(req.body);
  try {
    // Fetch category_id for the given category name
    const categoryData = await Category.findOne({
      where: { category_name: category },
      raw: true, // raw: true returns the data as plain object
    });

    if (!categoryData) {
      return res.status(404).json({ message: "Category not found" });
    }

    const category_id = categoryData.category_id;

    // Update Gig category
    await Gig_Categories.update(
      { category_id }, // Update the category_id field
      { where: { gig_id } } // Condition to find the relevant gig
    );

    // Update the Gig table
    await Gigs.update(
      { title: gigTitle, budget, category_id, features },
      { where: { gig_id } }
    );

    for (skillDetail of skillDetails) {
      if (skillDetail.status == "updated") {
        const updatedFrom = skillDetail.updatedFrom;
        const updatedTo = skillDetail.updatedTo;
        const updatedFrom_id = await Skills.findOne(
          {
            where: { skill_name: updatedFrom },
          },
          { raw: true }
        );
        const updatedTo_id = await Skills.findOne(
          {
            where: { skill_name: updatedTo },
          },
          { raw: true }
        );
        await Gig_Skills.destroy({
          where: { gig_id, skill_id: updatedFrom_id.skill_id },
        });
        await Gig_Skills.create({
          gig_id,
          skill_id: updatedTo_id.skill_id,
        });
      } else {
        const addedSkill = skillDetail.addedSkill;
        await Gig_Skills.create({ gig_id, skill_id: addedSkill });
      }
    }
    next();
  } catch (e) {
    next(e);
  }
};
const FetchGig = async (req, res, next) => {
  const { user_id, gig_id } = req.body;
  const results = [];
  try {
    const gigResults = await Gigs.findAll({
      include: [
        {
          model: Gig_Categories,
          where: {
            gig_id: gig_id,
          },
          attributes: ["category_id"],
        },
      ],
      raw: true,
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
const DeleteGig = async (req, res, next) => {
  console.log(req.body);
  const { gig_id } = req.body;

  // Validate if gig_id exists in the request
  if (!gig_id) {
    return res.status(400).json({ error: "Gig ID is required." });
  }
  const deleteGigSkill = await Gig_Skills.destroy({
    where: { gig_id: gig_id },
  });
  const deleteGigCategory = await Gig_Skills.destroy({
    where: { gig_id: gig_id },
  });
  const deleted = await Freelancer_Gigs.destroy({
    where: {
      gig_id: gig_id,
    },
  });
  // Find and delete the gig in the database
  const deletedGig = await Gigs.destroy({ where: { gig_id: gig_id } });

  if (!deletedGig) {
    return res.status(404).json({ error: "Gig not found." });
  }

  return res
    .status(200)
    .json({ message: "Gig deleted successfully.", gig: deletedGig });
};

const FetchAllGigs = async (req, res, next) => {
  console.log(req.query);
  const { page, limit } = req.query;
  const pageNumber = parseInt(page) || 1; // Default to 1 if no page is provided
  const limitNumber = parseInt(limit) || 3; // Default to 3 if no limit \is provided
  const offset = (pageNumber - 1) * limit;
  const { extracted_categories, extracted_budget } = req.body;
  console.log("eXTRACTED CATS", extracted_categories);
  const results = [];
  const cacheKey = `gigs:page=${pageNumber}:limit=${limitNumber}`;
  try {
    const cachedAllGigs = await cacher.get(cacheKey);
    if (cachedAllGigs) {
      console.log("IT IS A HITTTTT FOR ALL GIGS");
      return res.status(200).json({
        results: JSON.parse(cachedAllGigs),
        extracted_categories,
        extracted_budget,
      });
    }
    const gigResults = await Gigs.findAll({
      include: [
        {
          model: Freelancer_Gigs,
          attributes: ["user_id"],
        },
        {
          model: Gig_Categories,
          attributes: ["category_id"],

          include: [
            {
              model: Category,
              attributes: ["category_name"],
            },
          ],
        },
      ],
      raw: true,
      offset: offset, // Apply offset for pagination
      limit: limitNumber, // Apply limit
      order: [
        [
          { model: Gig_Categories },
          { model: Category },
          "category_name",
          "ASC",
        ],
      ], // Order by category_name in ascending order
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
      const freelancer = await User.findOne({
        where: { user_id: gig["Freelancer_Gig.user_id"] },
        attributes: ["first_name", "profilePic"],
        raw: true,
      });
      const freelancerRating = await Freelancer_Ratings.findOne({
        where: {
          freelancer_id: gig["Freelancer_Gig.user_id"], // Adjust this based on how gig object is structured
        },
        attributes: ["total_rating", "rating_count"], // Correct the typo here
        raw: true, // Keep raw if you want a plain object response
      });

      console.log(skillResult);
      console.log(categoryName.category_name);
      gig.category_name = categoryName.category_name;
      gig.skills_names = skillResult[0]["Skills.skill_names"];
      gig.freelancer_name = freelancer?.first_name;
      gig.profilePic = freelancer?.profilePic;
      gig.freelancer_rating =
        freelancerRating?.total_rating / freelancerRating?.rating_count;
      gig.freelancer_id = gig["Freelancer_Gig.user_id"];
      results.push(gig);
    }
    await cacher.setEx(cacheKey, 3600, JSON.stringify(results));
    res.status(200).json({ results, extracted_categories, extracted_budget });
  } catch (e) {
    next(e); // Pass any error to the next middleware
  }
};
const EditFeauturesBudget = async (req, res, next) => {
  const {
    gig_id,
    standard_features,
    advanced_features,
    standard_budget,
    advanced_budget,
  } = req.body;
  console.log(req.body);

  try {
    // Update the gig features and budget
    const [updatedRowsCount] = await Gigs.update(
      {
        standard_features,
        advanced_features,
        standard_budget,
        advanced_budget,
      },
      {
        where: { gig_id },
      }
    );

    next();
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const fetchTopRatedGigs = async (req, res) => {
  try {
    const cachedTopRatedGigs = await cacher.get("top_rated_gigs");
    if (cachedTopRatedGigs) {
      return res.status(200).json(JSON.parse(cachedTopRatedGigs));
    }
    const gigResults = [];
    const categories = await Category.findAll({
      attributes: ["category_id"],
      raw: true,
    });
    for (category of categories) {
      const catGigs = await Gig_Categories.findAll({
        where: {
          category_id: category.category_id,
        },
        include: [
          {
            model: Gigs,
            include: [
              {
                model: Freelancer_Gigs,

                include: [
                  {
                    model: Freelancer,
                    include: [
                      {
                        model: Freelancer_Ratings,
                      },
                    ],
                  },
                  {
                    model: User,
                    attributes: ["first_name", "profilePic"],
                  },
                ],
              },
            ],
          },
          {
            model: Category,
            attributes: ["category_name"],
          },
        ],
      });
      const validGigs = catGigs.filter(
        (gig) =>
          gig.Gig && gig.Gig.Freelancer_Gig && gig.Gig.Freelancer_Gig.User
      );
      const flattenedGigs = validGigs.map((gig) => ({
        category_id: gig.category_id,
        gig_id: gig.gig_id,
        gigImage: gig.Gig.picture[0],
        category_name: gig.Category.category_name,
        freelancer_name: gig.Gig.Freelancer_Gig.User.first_name,
        profile_pic: gig.Gig.Freelancer_Gig.User.profilePic,
        total_rating:
          gig.Gig.Freelancer_Gig.Freelancer.Freelancer_Rating?.total_rating ||
          0,
        rating_count:
          gig.Gig.Freelancer_Gig.Freelancer.Freelancer_Rating?.rating_count ||
          0,
      }));
      const topRatedGig = flattenedGigs.reduce((topGig, currentGig) => {
        return currentGig.total_rating > (topGig?.total_rating || 0)
          ? currentGig
          : topGig;
      }, null);
      gigResults.push(topRatedGig);
    }
    await cacher.setEx(
      "top_rated_gigs",
      3600,
      JSON.stringify(gigResults.slice(0, 5))
    );
    res.status(200).json(gigResults.slice(0, 5));
  } catch (error) {
    console.error("Error fetching top-rated gigs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top-rated gigs",
      error: error.message,
    });
  }
};

module.exports = {
  FetchGigs,
  EditGig,
  FetchGig,
  DeleteGig,
  FetchAllGigs,
  EditFeauturesBudget,
  fetchTopRatedGigs,
};
