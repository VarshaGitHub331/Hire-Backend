const db = require("../models"); // Assuming models are correctly imported
const sequelize = require("../models");

const {
  Category,
  User,
  Freelancer,
  Client,
  Skills,
  Gigs,
  Gig_Skills,
  Freelancer_Gigs,
  Freelancer_Category,
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
  Freelancer_Skills,
  Order_Timeline,
  Client_Ratings,
  Order,
  Review,
} = db;

module.exports = {
  User,
  Freelancer,
  Client,
  Category,
  Freelancer_Category,
  Freelancer_Skills,
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
  Order_Timeline,
  Client_Ratings,
};
