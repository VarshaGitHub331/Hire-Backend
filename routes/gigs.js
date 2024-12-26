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
} = require("../controllers/AIControllers.js");
const WrapAsync = require("../utils/WrapAsync.js");
const { extractSkills } = require("../controllers/AIControllers.js");
gigRouter.get("/getGigs", WrapAsync(FetchGigs));
gigRouter.put("/editGig", WrapAsync(EditGig), WrapAsync(FetchGig));
gigRouter.get("/fetchGig", WrapAsync(FetchGig));
gigRouter.delete("/deleteGig", WrapAsync(DeleteGig));
gigRouter.get("/allGigs", WrapAsync(FetchAllGigs));
gigRouter.get(
  "/tailoredGigs",
  WrapAsync(extractClientRequirements),
  WrapAsync(findSimilarCategories)
);
gigRouter.post("/aiFeatures", WrapAsync(getFeatures));
gigRouter.put(
  "/editFeaturesBudget",
  WrapAsync(EditFeauturesBudget),
  WrapAsync(FetchGig)
);
module.exports = gigRouter;
