const {
  Freelancer,
  Category,
  Freelancer_Category,
  Freelancer_Skills,
  Applicants,
  Bids,
  Job_Postings,
  Skills,
  Order,
  Gigs,
  Freelancer_Gigs,
  Gig_Categories,
  Gig_Skills,
  Review,
  User,
  Job_Skills,
  Job_Categories,
  Freelancer_Ratings,
} = require("../utils/InitializeModels");
const sequelize = require("../utils/Connection.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const axios = require("axios");
const crypto = require("crypto");
const { cacher } = require("../utils/redisClient");
// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const { raw } = require("mysql2");
const { Sequelize } = require("../models/index.js");
const { response } = require("express");
const { PassThrough } = require("stream");
const { group } = require("console");
if (Gigs !== undefined) {
  console.log("NOT UNDEFINED");
}
const UpdateProfile = (req, res, next) => {
  console.log("HERE FOR EDITING FREELANCER PROFILE");
  console.log(req.body);
  const { resume_url, profile, linkedin, cost, user_id } = req.body;
  if (!user_id) {
    res.status(404).json("user_id cannot be null");
  }
  try {
    const updated = Freelancer.update(
      {
        profile,
        linkedin,
        cost,
        resume: resume_url,
      },
      { where: { user_id: user_id } }
    );
    res.status(201).json(updated);
  } catch (e) {
    console.log(e);
    return e;
  }
};
const UpdateCategories = async (req, res, next) => {
  console.log("I AM IN THE UPDATING CATEGORIES ONE");
  const { categories, user_id } = req.body;
  if (!user_id) {
    res.status(404).json("user_id cannot be null here");
  }
  console.log(req.body);
  try {
    for (c of categories) {
      const category_item = await Category.findOne({
        where: { category_id: c },
      });
      console.log(category_item);
      if (category_item) {
        const row_exists = await Freelancer_Category.findOne({
          where: { user_id, category_id: category_item.category_id },
        });
        if (!row_exists) {
          await Freelancer_Category.create({
            user_id,
            category_id: category_item.category_id,
          });
          console.log("done inserting into freelancer_categories");
        }
      } else {
        console.log("NO CATEORY FOUND");
      }
    }
    res.status(201).json({ update: true });
  } catch (e) {
    next(e);
  }
  next();
};
const AddSkills = async (req, res, next) => {
  console.log("In Add Skills");
  console.log(req.body);
  const { skills, user_id } = req.body;
  if (!user_id) {
    res.status(401).json("This is invalid username");
  }
  try {
    for (s of skills) {
      const exist = await Freelancer_Skills.findOne({
        where: { user_id: user_id, skill_id: s.skill_id },
      });
      if (!exist) {
        await Freelancer_Skills.create({
          user_id: user_id,
          skill_id: s.skill_id,
        });
        console.log("inserted skill");
      }
    }
    res.status(200).json("Inserted");
  } catch (e) {
    next(e);
  }
};
const BidPosting = async (req, res, next) => {
  const { user_id, job_id, bid_amount, bid_details } = req.body;
  if (!user_id || !job_id || !bid_amount || !bid_details) {
    res.status(401).json("Please enter complete details");
  }
  try {
    const applied = await Applicants.findOne({
      where: {
        applicant_id: user_id,
        job_id: job_id,
      },
    });
    if (!applied) {
      console.log("doing next");
      const newApplicant = await Applicants.create({
        job_id,
        applicant_id: user_id,
      });
      console.log(newApplicant);
    }
    next();
  } catch (e) {
    next(e);
  }
};
const BidDetails = async (req, res, next) => {
  const { bid_amount, bid_details, user_id, job_id } = req.body;
  try {
    const job = await Job_Postings.findOne({ where: { job_id } });
    const bid = await Bids.create({
      job_posting_id: job_id,
      bidder_id: user_id,
      bid_amount,
      bid_details,
      bid_status: "pending",
      client_id: job.user_id,
    });
    res.status(202).json("Bid has been created");
  } catch (e) {
    next(e);
  }
};
const insertFoundSkills = async (req, res, next) => {
  const { user_id } = req.body;
  console.log("I am here in ");
  const extractedSkills = req.body.extracted_skills;
  for (let extractedSkill of extractedSkills) {
    let skill = await Skills.findOne({
      attributes: ["skill_id", "category_id"],
      where: { skill_name: extractedSkill },
      raw: true,
    });

    await Freelancer_Skills.create({ user_id, skill_id: skill.skill_id });
    let found = await Freelancer_Category.findOne({
      where: {
        user_id: user_id,
        category_id: skill.category_id,
      },
      raw: true,
    });
    if (!found) {
      await Freelancer_Category.create({
        user_id,
        category_id: skill.category_id,
      });
      console.log(
        "Inserted freelancer category into the freelancer_categories table"
      );
    }
  }
  res.status(202).json("Inserted extracted skills");
};
const CreateGig = async (req, res, next) => {
  let {
    title,
    gigCategories,
    user_id,
    gigSkills,
    budget,
    features,
    gigDesc,
    gigFiles,
    standard_budget,
    advanced_budget,
    duration,
    revisions,
    standard_features,
    advanced_features,
  } = req.body;
  console.log(req.body);
  // Create the new Gig record
  if (typeof features === "string") {
    features = JSON.parse(features);
  }
  if (typeof gigSkills === "string") {
    gigSkills = JSON.parse(gigSkills);
  }
  const gig = await Gigs.create(
    {
      title,
      description: gigDesc,
      picture: gigFiles,
      budget,
      features,
      standard_budget,
      advanced_budget,
      standard_features,
      advanced_features,
      duration,
      revisions,
    },
    { raw: true }
  );
  console.log("Created a new Gig ", gig);

  // Create the Freelancer_Gigs association
  const freelancerGig = await Freelancer_Gigs.create({
    gig_id: gig.gig_id,
    user_id,
  });
  console.log("Created freelancer gig");

  // Find the category for the gig
  const category = await Category.findOne({
    attributes: ["category_id"],
    where: { category_name: gigCategories },
  });

  // Create the Gig_Categories association
  if (category) {
    await Gig_Categories.create({
      gig_id: gig.gig_id,
      category_id: category.category_id,
    });
    console.log("Created gig category");
  } else {
    console.log("Category not found");
  }

  // Set the gig_id in the request body and proceed to the next middleware
  req.body.gig_id = gig.gig_id;
  req.body.extractText = gigDesc;
  next();
};

const AddGigSkills = async (req, res, next) => {
  let skillsToAdd = req.body.gigSkills;
  console.log("Skills to Add:", skillsToAdd);

  // If the skills are passed as a string, try parsing them into an array
  if (typeof skillsToAdd === "string") {
    skillsToAdd = JSON.parse(skillsToAdd); // This will convert a stringified array to an array
  }

  // Ensure skillsToAdd is an array
  if (!Array.isArray(skillsToAdd)) {
    return res.status(400).json({ error: "Skills should be an array" });
  }

  const { user_id, gig_id } = req.body;

  // Check if gig exists (optional but recommended)
  const gigExists = await Gigs.findOne({ where: { gig_id } });
  if (!gigExists) {
    return res.status(404).json({ error: "Gig not found" });
  }

  try {
    // Find the skills in the Skills table
    const skillRecords = await Skills.findAll({
      where: {
        skill_name: {
          [Sequelize.Op.in]: skillsToAdd,
        },
      },
      raw: true,
    });

    console.log("Skill Records Found:", skillRecords);

    // If no skills are found, return an error response
    if (!skillRecords || skillRecords.length === 0) {
      return res.status(200).json({
        error: "Skills not found in the database,insert without skills",
      });
    }

    // Add each skill to the Gig_Skills table
    for (const skill of skillRecords) {
      console.log(skill);
      await Gig_Skills.create({
        gig_id,
        skill_id: skill.skill_id,
      });
    }

    // Commit the transaction if all operations are successful

    // Send a success response
    res.status(200).json("Done populating skills for gig");
  } catch (error) {
    console.error("Error adding gig skills:", error);
    await transaction.rollback(); // Rollback transaction in case of error
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const profileUserWithAI = async (req, res, next) => {
  const { user_id } = req.body;

  try {
    const freelancer = await Freelancer.findOne({
      where: { user_id },
    });

    if (!freelancer || !freelancer.resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const resumePath = freelancer.resume;
    console.log("Resume URL:", resumePath);

    // Fetch the PDF as binary data
    const remoteResponse = await axios.get(resumePath, {
      responseType: "arraybuffer",
    });
    const pdfBuffer = remoteResponse.data;

    // Parse the PDF text
    const data = await pdfParse(pdfBuffer);
    const resumeText = data.text;

    // Extract skills using AI
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Extract all relevant skills from the following resume:\n${resumeText},donot hallucinate any skill.`;

    const aiResponse = await model.generateContent(prompt);

    // ✅ Log entire AI response for debugging
    console.log("AI Response:", JSON.stringify(aiResponse, null, 2));

    // ✅ Ensure correct path to skills
    const candidates = aiResponse?.response?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from AI model");
    }

    const contentParts = candidates[0]?.content?.parts;
    if (!contentParts || contentParts.length === 0) {
      throw new Error("AI response has no content parts");
    }

    const extractedSkillsText = contentParts[0].text;

    // ✅ Extract only skills, clean up Markdown & headers
    const extractedSkills = extractedSkillsText
      .split("\n")
      .map((skill) => skill.replace(/\*|\*\*/g, "").trim()) // Remove markdown symbols
      .filter((skill) => skill && !skill.includes("Skills:")); // Remove section headers

    req.body.extractedSkills = extractedSkills;
    console.log(req.body.extractedSkills);
    next();
  } catch (e) {
    console.error("Error extracting skills:", e.message);
    res.status(500).json({ error: e.message || "Failed to process resume" });
  }
};
const mapResumeSkills = async (req, res, next) => {
  const fetchedSkills = req.body.extractedSkills;
  const { user_id } = req.body;
  const dbSkills = await Skills.findAll({
    attributes: ["skill_id", "skill_name"],
    raw: true,
  });

  const textCategories = [];
  for (let s of dbSkills) {
    textCategories.push(s.skill_name);
  }

  const response = await fetch("http://127.0.0.1:5000/extract_skills", {
    method: "POST",
    body: JSON.stringify({
      generated_skills: fetchedSkills,
      db_skills: textCategories,
    }),
    headers: { "Content-type": "application/json" },
  });

  const data = await response.json();
  console.log(data);

  for (let s of data.extracted_skills) {
    let c = await Skills.findOne({
      attributes: ["category_id", "skill_id"],
      where: { skill_name: s },
      raw: true,
    });

    console.log(c);

    // Check if the Freelancer_Category record already exists
    const existingCategory = await Freelancer_Category.findOne({
      where: {
        user_id,
        category_id: c.category_id,
      },
    });

    // If no existing category is found, insert new record
    if (!existingCategory) {
      await Freelancer_Category.create({
        user_id,
        category_id: c.category_id,
      });
    }

    // Check if the Freelancer_Skills record already exists
    const existingSkill = await Freelancer_Skills.findOne({
      where: {
        user_id,
        skill_id: c.skill_id,
      },
    });

    // If no existing skill is found, insert new record
    if (!existingSkill) {
      await Freelancer_Skills.create({
        user_id,
        skill_id: c.skill_id,
      });
    }
  }

  res.status(201).json("Profiled User");
};
const updateCategories = async (req, res) => {
  console.log("Called here to update categories");
  try {
    const { user_id, freelancerCategories } = req.body;

    if (!user_id || !Array.isArray(freelancerCategories)) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Extract category IDs from freelancerCategories
    const categoryIds = freelancerCategories.map((cat) => cat.category_id);

    // Step 1: Remove only categories that are NOT in the new list
    await Freelancer_Category.destroy({
      where: {
        user_id,
        category_id: { [Sequelize.Op.notIn]: categoryIds },
      },
    });

    // Step 2: Find existing categories
    const existingCategories = await Freelancer_Category.findAll({
      where: {
        user_id,
        category_id: { [Sequelize.Op.in]: categoryIds },
      },
    });

    const existingCategoryIds = existingCategories.map(
      (cat) => cat.category_id
    );

    // Step 3: Insert only new categories that are not already present
    const newCategories = categoryIds
      .filter((cat_id) => !existingCategoryIds.includes(cat_id))
      .map((cat_id) => ({ user_id, category_id: cat_id }));

    if (newCategories.length > 0) {
      await Freelancer_Category.bulkCreate(newCategories);
    }

    // Send response once all operations are complete
    return res
      .status(200)
      .json({ message: "Categories updated successfully!" });
  } catch (error) {
    console.error("Error updating categories:", error);
  }
};

const updateSkills = async (req, res) => {
  console.log("Called here to update skills");
  try {
    const { user_id, freelancerSkills } = req.body;
    console.log(freelancerSkills);
    if (!user_id || !Array.isArray(freelancerSkills)) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Extract skill IDs from freelancerSkills
    const skillIds = freelancerSkills.map((skill) => skill.skill_id);

    // Step 1: Remove only skills that are NOT in the new list
    await Freelancer_Skills.destroy({
      where: {
        user_id,
        skill_id: { [Sequelize.Op.notIn]: skillIds },
      },
    });

    // Step 2: Find existing skills
    const existingSkills = await Freelancer_Skills.findAll({
      where: {
        user_id,
        skill_id: { [Sequelize.Op.in]: skillIds },
      },
    });

    const existingSkillIds = existingSkills.map((skill) => skill.skill_id);

    // Step 3: Insert only new skills that are not already present
    const newSkills = skillIds
      .filter((skill_id) => !existingSkillIds.includes(skill_id))
      .map((skill_id) => ({ user_id, skill_id }));

    if (newSkills.length > 0) {
      await Freelancer_Skills.bulkCreate(newSkills);
    }

    console.log("DONE UPDATING SKILLS FOR FREELANCER");
    // Return the response after all async operations are complete
    return res.status(200).json({ message: "Skills updated successfully!" });
  } catch (error) {
    console.error("Error updating skills:", error);
    // Make sure to return here to stop further execution
  }
};

const getFreelancerRatingsGrowth = async (req, res, next) => {
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
const getFreelacerOrdersGrowth = async (req, res, next) => {
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
        acceptor: user_id,
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
const JobsForFreelancer = async (req, res, next) => {
  console.log("HEREE");
  const { user_id, page, limit } = req.query;
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 3;
  const offset = (pageNumber - 1) * limitNumber;

  try {
    // Get freelancer's skills
    const freelancerSkills = await Freelancer_Skills.findAll({
      attributes: ["skill_id"],
      where: { user_id },
      raw: true,
    });

    const freelancerSkillIds = freelancerSkills.map((skill) => skill.skill_id);
    const skillHash = crypto
      .createHash("md5")
      .update(freelancerSkillIds.sort().join(",")) // Sorted for consistency
      .digest("hex");
    const cacheKey = `jobs:skills:${skillHash}:page:${pageNumber}:limit:${limitNumber}`;

    // Check Redis cache
    const cachedData = await cacher.get(cacheKey);
    if (cachedData) {
      console.log("Serving jobs from Cache");
      return res.status(200).json(JSON.parse(cachedData));
    }
    let jobs;
    if (freelancerSkillIds.length == 0) {
      // Freelancer has no skills, return all jobs
      jobs = await Job_Postings.findAll({
        include: [
          {
            model: Skills,
            through: { attributes: [] },
            attributes: ["skill_name", "skill_id"],
          },
          {
            model: Category,
            through: { attributes: [] },
            attributes: ["category_name", "category_id"],
          },
        ],
        limit: limitNumber,
        offset,
        logging: console.log, // Log SQL Quer
      });
      console.log("Fetched Jobs are", jobs);
    } else {
      // Fetch jobs that match at least one freelancer skill
      jobs = await Job_Postings.findAll({
        include: [
          {
            model: Skills,
            through: { attributes: [] },
            attributes: ["skill_name", "skill_id"],
            where: { skill_id: { [Sequelize.Op.in]: freelancerSkillIds } },
          },
          {
            model: Category,
            through: { attributes: [] },
            attributes: ["category_name", "category_id"],
          },
        ],
        limit: limitNumber,
        offset,
        logging: console.log, // Log SQL Quer
      });
    }
    console.log("The jobs are ", jobs);
    // Store response in cache
    await cacher.set(cacheKey, JSON.stringify(jobs), "EX", 3600);

    console.log("Data Cached & Sent");
    res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
};
const fetchFreelancerProfile = async (req, res, next) => {
  const { user_id } = req.query;
  console.log(user_id);

  try {
    // Fetching the User Profile
    const UserProfile = await Freelancer.findOne({
      where: {
        user_id,
      },
      include: [
        {
          model: User,
          required: true,
          attributes: ["first_name", "last_name"],
          include: {
            model: Freelancer_Skills,
            include: [
              {
                model: Skills,
                attributes: ["skill_name"],
              },
            ],
          },
        },
        {
          model: Freelancer_Ratings,
        },
      ],
    });

    // Return 404 if no profile is found
    if (!UserProfile) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    // Convert Sequelize instance to plain object
    const userProfileObj = UserProfile.toJSON();

    // Count Total Ratings
    const totalRatings = await Review.count({
      where: {
        reviewee_id: user_id,
      },
    });

    // Count High Ratings (Greater than 3)
    const highRatingsCount = await Review.count({
      where: {
        reviewee_id: user_id,
        rating: {
          [Sequelize.Op.gt]: 3,
        },
      },
    });

    // Calculate Percentage
    const highRatingsPercentage =
      totalRatings > 0 ? (highRatingsCount / totalRatings) * 100 : 0;

    // Determine isTopRated (Threshold: 70% or more high ratings)
    userProfileObj.isTopRated = highRatingsPercentage >= 70;

    // Sending Response
    res.status(200).json({ UserProfile: userProfileObj });
  } catch (e) {
    next(e);
  }
};

const fetchFreelancerReviews = async (req, res, next) => {
  try {
    const { user_id, page, limit } = req.query;
    console.log(user_id);
    const pageNumber = parseInt(page) || 1; // Default to 1 if no page is provided
    const limitNumber = parseInt(limit) || 3; // Default to 3 if no limit is provided

    // Calculate the offset for pagination: (pageNumber - 1) * limit
    const offset = (pageNumber - 1) * limitNumber;
    const reviews = await Review.findAll({
      where: { reviewee_id: user_id },
      include: [
        {
          model: Order,
        },
      ],
      offset,
      limit: limitNumber,
      raw: true,
    });

    for (const review of reviews) {
      const reviewer_id = review.reviewer_id;
      const user = await User.findOne({
        attributes: ["first_name"],
        where: { user_id: reviewer_id },
        raw: true,
      });

      // Add the reviewer's name to the review object
      review.reviewer_name = user ? user.first_name : "Anonymous";
    }

    res.status(200).json(reviews);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  UpdateProfile,
  UpdateCategories,
  AddSkills,
  BidPosting,
  BidDetails,
  CreateGig,
  AddGigSkills,
  insertFoundSkills,
  profileUserWithAI,
  mapResumeSkills,
  updateCategories,
  updateSkills,
  getFreelancerRatingsGrowth,
  getFreelacerOrdersGrowth,
  JobsForFreelancer,
  fetchFreelancerProfile,
  fetchFreelancerReviews,
};
