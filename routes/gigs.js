const express = require("express");
const gigRouter = express.Router();
const {
  FetchGigs,
  EditGig,
  FetchGig,
  DeleteGig,
  FetchAllGigs,
  EditFeauturesBudget,
  fetchTopRatedGigs,
} = require("../controllers/GigControllers");
const {
  extractClientRequirements,
  findSimilarCategories,
  getFeatures,
  generateAIDescription,
} = require("../controllers/AIControllers.js");
const WrapAsync = require("../utils/WrapAsync.js");
const {
  extractSkills,
  extractCategoriesForTailoredGigs,
} = require("../controllers/AIControllers.js");
const { AuthUser } = require("../controllers/UserController.js");
gigRouter.get("/getGigs", AuthUser, WrapAsync(FetchGigs));
gigRouter.put("/editGig", AuthUser, WrapAsync(EditGig), WrapAsync(FetchGig));
gigRouter.get("/fetchGig", AuthUser, WrapAsync(FetchGig));
gigRouter.delete("/deleteGig", AuthUser, WrapAsync(DeleteGig));
gigRouter.get("/allGigs", AuthUser, WrapAsync(FetchAllGigs));
gigRouter.post(
  "/tailoredGigs",
  WrapAsync(extractClientRequirements),
  WrapAsync(extractCategoriesForTailoredGigs),
  WrapAsync(FetchAllGigs)
);
gigRouter.post("/aiFeatures", AuthUser, WrapAsync(getFeatures));
gigRouter.put(
  "/editFeaturesBudget",
  AuthUser,
  WrapAsync(EditFeauturesBudget),
  WrapAsync(FetchGig)
);
gigRouter.post(
  "/generateAIDescription",
  AuthUser,
  WrapAsync(generateAIDescription)
);
gigRouter.get("/fetchTopRatedGigs", WrapAsync(fetchTopRatedGigs));
module.exports = gigRouter;
