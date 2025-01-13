const express = require("express");
const WrapAsync = require("../utils/WrapAsync");
const reviewRouter = express.Router();
const { createFreelancerReview } = require("../controllers/ReviewController");
reviewRouter.post("/createFreelancerReview", WrapAsync(createFreelancerReview));

module.exports = reviewRouter;
