const express = require("express");
const gigRouter = express.Router();
const {
  FetchGigs,
  EditGig,
  FetchGig,
  DeleteGig,
} = require("../controllers/GigControllers");
const WrapAsync = require("../utils/WrapAsync.js");
gigRouter.get("/getGigs", WrapAsync(FetchGigs));
gigRouter.put("/editGig", WrapAsync(EditGig), WrapAsync(FetchGig));
gigRouter.get("/fetchGig", WrapAsync(FetchGig));
gigRouter.delete("/deleteGig", WrapAsync(DeleteGig));
module.exports = gigRouter;
