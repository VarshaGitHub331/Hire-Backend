const { Applicants, Bids } = require("../utils/InitializeModels");

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

module.exports = { becomeApplicant };
