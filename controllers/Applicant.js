const {
  Applicants,
  Bids,
  Freelancer,
  User,
  Job_Postings,
} = require("../utils/InitializeModels");
const { sendProposalConfirmationMail } = require("../utils/Mail");
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
    const { bid_id, applicant_id } = req.body; // Changed from req.query to req.body
    console.log("Accepting bid with ID:", bid_id);

    const result = await Bids.update(
      { bid_status: "accepted" },
      { where: { bidId: bid_id } }
    );

    if (result[0] === 0) {
      return res.status(404).json({ message: "Bid not found" });
    }

    req.body.status == "Accepted";
    next();
  } catch (error) {
    console.error("Error accepting proposal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const rejectProposal = async (req, res, next) => {
  try {
    const { bid_id, applicant_id } = req.body; // Changed from req.query to req.body
    console.log("Rejecting bid with ID:", bid_id);

    const result = await Bids.update(
      { bid_status: "rejected" },
      { where: { bidId: bid_id } }
    );

    if (result[0] === 0) {
      return res.status(404).json({ message: "Bid not found" });
    }

    req.body.status == "Rejected";
    next();
  } catch (error) {
    console.error("Error rejecting proposal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const sendConfirmationMails = async (req, res, next) => {
  const { applicant_id, status, bid_id } = req.body;
  try {
    // Fetch the bidder's email
    const bidder = await User.findOne({
      attributes: ["email"],
      where: { user_id: applicant_id },
      raw: true,
    });

    if (!bidder) {
      return res.status(404).json({ message: "Bidder not found" });
    }

    // Fetch the bid details
    const bid = await Bids.findOne({
      where: { bidId: bid_id }, // Ensure `bid_id` is correctly named
      raw: true,
    });

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    // Fetch the job posting
    const job_posting = await Job_Postings.findOne({
      attributes: ["title", "user_id"],
      where: { job_id: bid.job_posting_id },
      raw: true,
    });

    if (!job_posting) {
      return res.status(404).json({ message: "Job posting not found" });
    }

    // Fetch the job poster's details
    const user = await User.findOne({
      attributes: ["first_name"],
      where: { user_id: job_posting.user_id },
      raw: true,
    });

    if (!user) {
      return res.status(404).json({ message: "Job poster not found" });
    }

    // Construct the email text
    let text;
    if (bid.bid_status == "accepted") {
      text = `Congratulations, your proposal for the posting "${job_posting.title}" has been accepted by ${user.first_name}.`;
    } else {
      text = `Sorry, your proposal for the posting "${job_posting.title}" has been rejected by ${user.first_name}.`;
    }

    // Send the confirmation email
    await sendProposalConfirmationMail(
      bidder.email,
      "Proposal Status Update",
      text
    );

    res.status(200).json({ message: "Email sent successfully" });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  becomeApplicant,
  getApplicants,
  acceptProposal,
  rejectProposal,
  sendConfirmationMails,
};
