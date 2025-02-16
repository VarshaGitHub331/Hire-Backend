const {
  becomeApplicant,
  getApplicants,
  acceptProposal,
  rejectProposal,
} = require("../controllers/Applicant");
const { generateAIProposal } = require("../controllers/AIControllers");
const express = require("express");
const WrapAsync = require("../utils/WrapAsync");
const { AuthUser } = require("../controllers/UserController");
const ApplicantRouter = express.Router();

ApplicantRouter.post("/becomeApplicant", WrapAsync(becomeApplicant));
ApplicantRouter.post("/generateAIProposal", WrapAsync(generateAIProposal));
ApplicantRouter.get("/getApplicants", WrapAsync(getApplicants));
ApplicantRouter.patch("/acceptProposal", WrapAsync(acceptProposal));
ApplicantRouter.patch("/rejectProposal", WrapAsync(rejectProposal));
module.exports = ApplicantRouter;
