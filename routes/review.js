const express = require("express");
const WrapAsync = require("../utils/WrapAsync");
const reviewRouter = express.Router();
const { createReview } = require("../controllers/ReviewController");
const { AuthUser } = require("../controllers/UserController");
reviewRouter.post("/createReview", AuthUser,WrapAsync(createReview));

module.exports = reviewRouter;
