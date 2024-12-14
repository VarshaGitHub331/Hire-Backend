const express = require("express");
const gigRouter = express.Router();
const { FetchGigs } = require("../controllers/GigControllers");
const WrapAsync = require("../utils/WrapAsync.js");
gigRouter.get("/getGigs", WrapAsync(FetchGigs));

module.exports = gigRouter;
