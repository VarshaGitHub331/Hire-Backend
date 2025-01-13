const express = require("express");
const WrapAsync = require("../utils/WrapAsync");
const reviewRouter = express.Router();
const { createReview } = require("../controllers/ReviewController");
reviewRouter.post("/createReview", WrapAsync(createReview));

module.exports = reviewRouter;
