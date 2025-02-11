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
  WrapAsync(extractSkillsFromPosting),
  WrapAsync(findSimilarSkills)
);
ClientRouter.post(
  "/createPosting",
  WrapAsync(CreatePosting),
  WrapAsync(PostingSkills),
  WrapAsync(PostingCategory)
);
ClientRouter.get("/getJobPostings", WrapAsync(getJobPostings));

ClientRouter.post("/updateProfile", AuthUser, WrapAsync(UpdateClientProfile));
ClientRouter.patch("/removePosting/:job_id", WrapAsync(RemovePosting));
ClientRouter.post("/editPosting", WrapAsync(editPosting));
ClientRouter.get("/getClientRatingsGrowth", WrapAsync(getClientRatingsGrowth));
ClientRouter.get("/getClientOrdersGrowth", WrapAsync(getClientOrdersGrowth));
module.exports = ClientRouter;
