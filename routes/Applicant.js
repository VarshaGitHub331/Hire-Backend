const {
  becomeApplicant,
  getApplicants,
  acceptProposal,
  rejectProposal,
  sendConfirmationMails,
  ViewProposals,
} = require("../controllers/Applicant");
const { generateAIProposal } = require("../controllers/AIControllers");
const express = require("express");
const WrapAsync = require("../utils/WrapAsync");
const { AuthUser } = require("../controllers/UserController");
const ApplicantRouter = express.Router();

ApplicantRouter.post("/becomeApplicant", AuthUser, WrapAsync(becomeApplicant));
ApplicantRouter.post(
  "/generateAIProposal",
  AuthUser,
  WrapAsync(generateAIProposal)
);
ApplicantRouter.get("/getApplicants", AuthUser, WrapAsync(getApplicants));
ApplicantRouter.patch(
  "/acceptProposal",
  AuthUser,
  WrapAsync(acceptProposal),
  WrapAsync(sendConfirmationMails)
);
ApplicantRouter.patch(
  "/rejectProposal",
  AuthUser,
  WrapAsync(rejectProposal),
  WrapAsync(sendConfirmationMails)
);
ApplicantRouter.get("/myProposals", AuthUser, WrapAsync(ViewProposals));
module.exports = ApplicantRouter;
