const express = require("express");
const gigRouter = express.Router();
const {
  FetchGigs,
  EditGig,
  FetchGig,
  DeleteGig,
  FetchAllGigs,
  EditFeauturesBudget,
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
gigRouter.get("/getGigs", WrapAsync(FetchGigs));
gigRouter.put("/editGig", WrapAsync(EditGig), WrapAsync(FetchGig));
gigRouter.get("/fetchGig", WrapAsync(FetchGig));
gigRouter.delete("/deleteGig", WrapAsync(DeleteGig));
gigRouter.get("/allGigs", WrapAsync(FetchAllGigs));
gigRouter.post(
  "/tailoredGigs",
  WrapAsync(extractClientRequirements),
  WrapAsync(extractCategoriesForTailoredGigs),
  WrapAsync(FetchAllGigs)
);
gigRouter.post("/aiFeatures", WrapAsync(getFeatures));
gigRouter.put(
  "/editFeaturesBudget",
  WrapAsync(EditFeauturesBudget),
  WrapAsync(FetchGig)
);
gigRouter.post("/generateAIDescription", WrapAsync(generateAIDescription));
module.exports = gigRouter;
