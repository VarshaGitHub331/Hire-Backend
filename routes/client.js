const {
  UpdateClientProfile,
  CreatePosting,
  PostingCategory,
  PostingSkills,
  RemovePosting,
  getClientOrdersGrowth,
  getClientRatingsGrowth,
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
  "/createPosting",
  WrapAsync(CreatePosting),
  WrapAsync(extractSkillsFromPosting),
  WrapAsync(findSimilarSkills)
);

ClientRouter.post("/updateProfile", AuthUser, WrapAsync(UpdateClientProfile));
ClientRouter.patch("/removePosting/:job_id", WrapAsync(RemovePosting));
ClientRouter.get("/getClientRatingsGrowth", WrapAsync(getClientRatingsGrowth));
ClientRouter.get("/getClientOrdersGrowth", WrapAsync(getClientOrdersGrowth));
module.exports = ClientRouter;
