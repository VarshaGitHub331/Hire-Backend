const { Sequelize } = require("sequelize");
const {
  Freelancer,
  Category,
  Freelancer_Category,
  Freelancer_Skills,
  Applicants,
  Bids,
  Job_Postings,
  Gig_Categories,
  Skills,
  Order,
} = require("../utils/InitializeModels");

async function FetchCategories(req, res, next) {
  try {
    const categories = await Category.findAll();
    console.log(categories);
    res.status(200).json({ categories: categories });
  } catch (e) {
    next(e);
  }
}
async function FetchAllSkils(req, res, next) {
  try {
    const skills = await Skills.findAll();
    res.status(200).json({ skills: skills });
  } catch (e) {
    next(e);
  }
}
const FetchSkills = async (req, res, next) => {
  console.log("In fetch skills");

  // Extract categories from the request body
  const categories = req.query.categories;
  console.log("The categories are ");
  console.log(categories);
  console.log("The most similar category is");
  console.log(req.body.most_similar_category);
  // Validate the categories input
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid or missing categories array" });
  }

  try {
    // Query all skills where category_id matches any of the categories
    const skills = await Skills.findAll({
      include: [
        {
          model: Category, // Perform JOIN with Categories table
          where: {
            [Sequelize.Op.or]: [
              // Apply OR condition
              { category_id: { [Sequelize.Op.in]: categories } }, // Match by category_id (numeric ID)
              { category_name: { [Sequelize.Op.in]: categories } }, // Match by category_name (string)
            ],
          },
          required: true, // INNER JOIN (only return skills that have matching categories)
          attributes: ["category_id"], // Fetch category attributes (id and name)
        },
      ],
      raw: true, // Returns plain objects (no Sequelize model instances)
    });

    console.log("Fetched skills:", skills);
    if (!req.body.AIGig) res.status(200).json(skills);
    else
      res.status(200).json({
        extracted_skills: skills,
        categories: req.query.categories,
        title: req.body.extractText,
        most_similar_category: req.body.most_similar_category,
      });
  } catch (e) {
    console.error("Error fetching skills:", e);
    next(e);
  }
};
const fetchPopularCategories = async (req, res, next) => {
  try {
    const popularCategories = await Gig_Categories.findAll({
      attributes: [
        "category_id",
        [Sequelize.fn("COUNT", Sequelize.col("gig_id")), "popularity"],
      ],
      where: {
        createdAt: {
          [Sequelize.Op.gt]: Sequelize.literal("NOW() - INTERVAL 30 DAY"),
        },
      },
      group: ["category_id"],
      order: [[Sequelize.literal("popularity"), "DESC"]],
      limit: 5,
      include: [
        {
          model: Category,
          attributes: ["category_name"],
        },
      ],
    });
    res.status(200).json(popularCategories);
  } catch (e) {
    next(e);
  }
};
module.exports = {
  FetchCategories,
  FetchSkills,
  FetchAllSkils,
  fetchPopularCategories,
};
