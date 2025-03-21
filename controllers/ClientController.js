const {
  Client,
  Job_Postings,
  Job_Categories,
  Job_Skills,
  Skills,
  Order,
  Review,
  Category,
} = require("../utils/InitializeModels");
const sequelize = require("../utils/Connection.js");
const { Sequelize } = require("../models/index.js");
const { response } = require("express");
const UpdateProfile = async (req, res, next) => {
  const { contact_number, user_id, contact_email, company_name } = req.body;
  if (!user_id) {
    res.status(404).json("User_id cannot be null");
  }
  try {
    const updated = await Client.update(
      { contact_number, contact_email, company_name },
      { where: { user_id: user_id } }
    );
    res.status(201).json(updated);
  } catch (e) {
    next(e);
  }
};
const CreatePosting = async (req, res, next) => {
  const {
    jobLocation,
    experience,
    jobTitle,
    jobType,
    minSalary,
    maxSalary,
    jobDescription,
    user_id,
    skills,
  } = req.body;

  if (
    !user_id ||
    !jobTitle ||
    !jobDescription ||
    !jobLocation ||
    !minSalary ||
    !maxSalary
  ) {
    return res
      .status(400)
      .json({ error: "Please enter proper details for creating posting" });
  }

  console.log(req.body);

  try {
    const newJob = await Job_Postings.create({
      user_id,
      title: jobTitle,
      description: jobDescription,
      min_budget: parseFloat(minSalary), // Convert to number
      max_budget: parseFloat(maxSalary), // Convert to number
      job_type: jobType,
      status: "Open", // Ensure it matches ENUM('True', 'False')
      location: jobLocation,
      experience,
      created_at: new Date(), // Explicitly setting timestamps
      updated_at: new Date(),
    });
    req.body.jobDescription = jobDescription;
    req.body.jobTitle = jobTitle;
    req.body.job_id = newJob.job_id;
    next();
  } catch (e) {
    console.log(e);
    next(e);
  }
};
const getJobPostings = async (req, res, next) => {
  console.log(req.query);
  const { user_id, page, limit } = req.query;
  const results = []; // Extract user_id from the request body
  const pageNumber = parseInt(page) || 1; // Default to 1 if no page is provided
  const limitNumber = parseInt(limit) || 3; // Default to 3 if no limit is provided

  // Calculate the offset for pagination: (pageNumber - 1) * limit
  const offset = (pageNumber - 1) * limitNumber;

  try {
    const jobResults = await Job_Postings.findAll({
      where: {
        user_id,
      },
      raw: true,
      offset: offset, // Apply offset for pagination
      limit: limitNumber, // Apply limit
    });
    for (job of jobResults) {
      const jobSkills = await Job_Skills.findAll({
        where: {
          job_id: job.job_id,
        },
        raw: true,
      });
      const fetchSkillIds = jobSkills.map((jobSkill) => jobSkill.skill_id);
      const skillNames = await Skills.findAll({
        attributes: ["skill_name"],
        where: {
          skill_id: {
            [Sequelize.Op.in]: fetchSkillIds,
          },
        },
      });
      const jobCategories = await Job_Categories.findAll({
        where: {
          job_id: job.job_id,
        },
        raw: true,
      });
      const FetchCategoriesIds = jobCategories.map(
        (jobCategory) => jobCategory.category_id
      );
      const categoryNames = await Category.findAll({
        attributes: ["category_name"],
        where: {
          category_id: {
            [Sequelize.Op.in]: FetchCategoriesIds,
          },
        },
      });
      job.skills = skillNames;
      job.categories = categoryNames;
    }
    res.status(200).json({ jobResults });
  } catch (e) {
    next(e); // Pass any error to the next middleware
  }
};
const PostingCategory = async (req, res, next) => {
  const { categories, job_id } = req.body;
  console.log(job_id);
  for (c of categories) {
    try {
      const found = await Job_Categories.findOne({
        where: { job_id, category_id: c },
      });
      if (!found) {
        await Job_Categories.create({ category_id: c, job_id });
        console.log("Posted Category");
      }
    } catch (e) {
      next(e);
    }
  }
  res.status(201).json("Job Posting created successfully");
};
const PostingSkills = async (req, res, next) => {
  try {
    const { skills, job_id } = req.body;

    if (!skills || skills.length === 0) {
      return res.status(400).json({ message: "No skills provided" });
    }

    // Find skills where skill_name is in extracted_skills array
    const jobSkills = await Skills.findAll({
      where: {
        skill_name: {
          [Sequelize.Op.in]: skills,
        },
      },
    });
    const categories = [];
    // Insert skills into Job_Skills table
    for (const skill of jobSkills) {
      await Job_Skills.create({ skill_id: skill.skill_id, job_id });
      categories.push(skill.category_id);
    }
    req.body.categories = categories;
    next();
  } catch (error) {
    console.error("Error processing skills:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
const RemovePosting = async (req, res, next) => {
  console.log("I was called");
  const { job_id } = req.params;
  const { status } = req.body;

  try {
    const job = await Job_Postings.findOne({ where: { job_id } });

    if (!job) {
      return res.status(404).json({ error: "Job posting not found" }); // ✅ Handle missing job case
    }

    await Job_Postings.update(
      { status },
      { where: { job_id } } // ✅ Correctly updates the database
    );
    const newJob = await Job_Postings.findOne({ where: { job_id }, raw: true });
    res.status(200).json({ newJob });
  } catch (e) {
    next(e);
  }
};

const getClientRatingsGrowth = async (req, res, next) => {
  const { user_id } = req.query;
  try {
    const ratings = await Review.findAll({
      attributes: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("created_at"), "%Y-%m"),
          "month",
        ], // Group by month
        [Sequelize.fn("AVG", Sequelize.col("rating")), "avg_rating"],
      ],
      where: { reviewee_id: user_id }, // Filter by freelancer ID
      group: [
        Sequelize.fn("DATE_FORMAT", Sequelize.col("created_at"), "%Y-%m"),
      ], // Group by month
      order: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("created_at"), "%Y-%m"),
          "ASC",
        ],
      ], // Sort by month
      raw: true, // Return plain objects
    });

    res.status(200).json({ monthlyRatings: ratings });
  } catch (e) {
    console.log("Error fetching ratings for freelancers", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const getClientOrdersGrowth = async (req, res, next) => {
  const { user_id } = req.query;
  try {
    const orders = await Order.findAll({
      attributes: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m"),
          "month",
        ], // Group by month
        [Sequelize.fn("COUNT", Sequelize.col("order_id")), "orders"],
      ],
      where: {
        creator: user_id,
        [Sequelize.Op.or]: [
          { status: "accepted" },
          {
            status: "progress",
          },
          {
            status: "complete",
          },
        ],
      }, // Filter by freelancer ID
      group: [Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m")], // Group by month
      order: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m"),
          "ASC",
        ],
      ], // Sort by month
      raw: true, // Return plain objects
    });

    res.status(200).json({ monthlyOrders: orders });
  } catch (e) {
    console.log("Error fetching ratings for freelancers", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const editPosting = async (req, res, next) => {
  const {
    location,
    experience,
    title,
    job_type,
    min_budget,
    max_budget,
    description,
    job_id,
  } = req.body;

  if (!job_id) {
    return res.status(400).json({ error: "Job ID is required" });
  }

  console.log("Editing job:", req.body);

  try {
    // Update job
    const [updatedCount] = await Job_Postings.update(
      {
        title,
        description,
        min_budget: parseFloat(min_budget),
        max_budget: parseFloat(max_budget),
        job_type,
        location,
        experience,
        updated_at: new Date(),
      },
      {
        where: { job_id },
      }
    );

    if (updatedCount === 0) {
      return res
        .status(404)
        .json({ error: "Job not found or no changes made" });
    }

    // Fetch and return updated job
    const updatedJob = await Job_Postings.findOne({
      where: { job_id },
    });

    res.status(200).json({ updatedJob });
  } catch (e) {
    console.error("Error editing job:", e);
    next(e);
  }
};

module.exports = {
  UpdateClientProfile: UpdateProfile,
  CreatePosting,
  PostingCategory,
  PostingSkills,
  RemovePosting,
  getClientRatingsGrowth,
  getClientOrdersGrowth,
  getJobPostings,
  editPosting,
};
