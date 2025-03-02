const express = require("express");
const WrapAsync = require("../utils/WrapAsync");
const dataRouter = express.Router();
const {
  FetchCategories,
  FetchSkills,
  FetchAllSkils,
  fetchPopularCategories,
} = require("../controllers/DataController");
dataRouter.get("/getCategories", WrapAsync(FetchCategories));
dataRouter.get("/fetchSkills", WrapAsync(FetchSkills));
dataRouter.get("/fetchAllSkills", WrapAsync(FetchAllSkils));
dataRouter.get("/fetchPopularCategories", WrapAsync(fetchPopularCategories));
module.exports = dataRouter;
