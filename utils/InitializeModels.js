const db = require("../models"); // Assuming models are correctly imported

db.sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synced successfully!");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

const {
  User,
  Category,
  Skills,
  Freelancer,
  Freelancer_Category,
  Freelancer_Skills,
  Client,
  Gigs,
  Gig_Category,
  Gig_Skills,
  Freelancer_Gigs,
  Job_Postings,
  Job_Categories,
  Job_Skills,
  Bids,
  Applicants,
  Order,
  Conversation,
  Messages,
  User_Messages,
  Reviews,
} = db;

module.exports = {
  User,
  Category,
  Skills,
  Freelancer,
  Freelancer_Category,
  Freelancer_Skills,
  Client,
  Gigs,
  Gig_Category,
  Gig_Skills,
  Freelancer_Gigs,
  Job_Postings,
  Job_Categories,
  Job_Skills,
  Bids,
  Applicants,
  Order,
  Conversation,
  Messages,
  User_Messages,
  Reviews,
};
