const db = require("../models"); // Assuming models are correctly imported
const sequelize = require("../models");

const {
  User,
  Freelancer,
  Client,
  Category,
  Skills,
  Gigs,
  Gig_Skills,
  Order,
  Review,
  Freelancer_Gigs,
  Freelancer_Ratings,
  Gig_Categories,
  Job_Postings,
  Job_Skills,
  Job_Categories,
  Conversation,
  Messages,
  User_Messages,
  Bids,
  Applicants,
} = db;

// Sync all models (with force: true to drop and recreate tables)
// WARNING: This will drop existing tables and recreate them.

module.exports = {
  User,
  Freelancer,
  Client,
  Category,
  Skills,
  Gigs,
  Gig_Skills,
  Order,
  Review,
  Freelancer_Gigs,
  Freelancer_Ratings,
  Gig_Categories,
  Job_Postings,
  Job_Skills,
  Job_Categories,
  Conversation,
  Messages,
  User_Messages,
  Bids,
  Applicants,
};
