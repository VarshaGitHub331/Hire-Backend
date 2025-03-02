const {
  UpdateClientProfile,
  CreatePosting,
  PostingCategory,
  PostingSkills,
  RemovePosting,
  getClientOrdersGrowth,
  getClientRatingsGrowth,
  getJobPostings,
  editPosting,
} = require("../controllers/ClientController");
const {
  extractSkillsFromPosting,
  findSimilarSkills,
} = require("../controllers/AIControllers");
const express = require("express");
const WrapAsync = require("../utils/WrapAsync");
const { AuthUser } = require("../controllers/UserController");
const ClientRouter = express.Router();

ClientRouter.post(
  "/getSkillsForPosting",
  AuthUser,
  WrapAsync(extractSkillsFromPosting),
  WrapAsync(findSimilarSkills)
);
ClientRouter.post(
  "/createPosting",
  AuthUser,
  WrapAsync(CreatePosting),
  WrapAsync(PostingSkills),
  WrapAsync(PostingCategory)
);
ClientRouter.get("/getJobPostings", AuthUser, WrapAsync(getJobPostings));

ClientRouter.post("/updateProfile", AuthUser, WrapAsync(UpdateClientProfile));
ClientRouter.patch(
  "/removePosting/:job_id",
  AuthUser,
  WrapAsync(RemovePosting)
);
ClientRouter.post("/editPosting", AuthUser, WrapAsync(editPosting));
ClientRouter.get(
  "/getClientRatingsGrowth",
  AuthUser,
  WrapAsync(getClientRatingsGrowth)
);
ClientRouter.get(
  "/getClientOrdersGrowth",
  AuthUser,
  WrapAsync(getClientOrdersGrowth)
);
module.exports = ClientRouter;
