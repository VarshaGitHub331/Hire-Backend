const {
  Freelancer,
  Category,
  Freelancer_Category,
  Freelancer_Skills,
  Applicants,
  Bids,
  Job_Postings,
  Skills,
  Gigs,
  Freelancer_Gigs,
  Gig_Categories,
  Gig_Skills,
} = require("../utils/InitializeModels");
const sequelize = require("../utils/Connection.js");

const { raw } = require("mysql2");
const { Sequelize } = require("../models/index.js");
if (Gigs !== undefined) {
  console.log("NOT UNDEFINED");
}
const UpdateProfile = (req, res, next) => {
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
    next(e);
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

module.exports = {
  UpdateProfile,
  UpdateCategories,
  AddSkills,
  BidPosting,
  BidDetails,
  CreateGig,
  AddGigSkills,
  insertFoundSkills,
};
