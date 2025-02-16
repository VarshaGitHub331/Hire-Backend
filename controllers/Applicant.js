const {
  Applicants,
  Bids,
  Freelancer,
  User,
} = require("../utils/InitializeModels");

const becomeApplicant = async (req, res, next) => {
  try {
    console.log(req.body);
    console.log("HERE TO APPLY");

    const { user_id, job, bid_proposal, estimated_time, bid_amount } = req.body;

    if (
      !user_id ||
      !job?.job_id ||
      !bid_proposal ||
      !estimated_time ||
      !bid_amount
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Create new applicant entry
    const newApplicant = await Applicants.create({
      job_id: job.job_id,
      applicant_id: user_id,
    });

    if (!newApplicant) {
      return res
        .status(500)
        .json({ error: "Failed to create applicant record." });
    }

    // Create bid entry
    const newBid = await Bids.create({
      job_posting_id: job.job_id,
      bidder_id: newApplicant.applicant_id, // Ensure this matches the schema
      bid_amount,
      bid_details: bid_proposal,
      estimated_time,
      bid_status: "pending",
    });

    res.status(200).json(newBid);
  } catch (error) {
    console.error("Error in becomeApplicant:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
const getApplicants = async (req, res, next) => {
  try {
    const { job_id, page = 1, pageSize = 10 } = req.query;

    if (!job_id) {
      return res.status(400).json({ message: "job_id is required" });
    }
    const limit = parseInt(pageSize); // Items per page
    const offset = (parseInt(page) - 1) * limit; // Skip items
    const applicantResults = await Applicants.findAll({
      include: [
        {
          model: Freelancer,

          include: [
            {
              model: User,
              attributes: ["first_name"],
            },
          ],
        },
        {
          model: Bids,
          foreignKey: "applicant_id",
          where: {
            job_posting_id: job_id,
          },
        },
      ],
      where: {
        job_id,
      },
      limit,
      offset,
    });

    // Format the response to remove unnecessary Sequelize metadata

    res.status(200).json(applicantResults);
  } catch (e) {
    next(e);
  }
};
const acceptProposal = async (req, res, next) => {
  try {
    const { bid_id } = req.body; // Changed from req.query to req.body
    console.log("Accepting bid with ID:", bid_id);

    const result = await Bids.update(
      { bid_status: "accepted" },
      { where: { bidId: bid_id } }
    );

    if (result[0] === 0) {
      return res.status(404).json({ message: "Bid not found" });
    }

    res.status(200).json({ message: "Your proposal was accepted" });
  } catch (error) {
    console.error("Error accepting proposal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const rejectProposal = async (req, res, next) => {
  try {
    const { bid_id } = req.body; // Changed from req.query to req.body
    console.log("Rejecting bid with ID:", bid_id);

    const result = await Bids.update(
      { bid_status: "rejected" },
      { where: { bidId: bid_id } }
    );

    if (result[0] === 0) {
      return res.status(404).json({ message: "Bid not found" });
    }

    res.status(200).json({ message: "Your proposal was rejected" }); // Fixed success message
  } catch (error) {
    console.error("Error rejecting proposal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  becomeApplicant,
  getApplicants,
  acceptProposal,
  rejectProposal,
};
