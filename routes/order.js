const express = require("express");
const OrderRouter = express.Router();

const WrapAsync = require("../utils/WrapAsync");
const { AuthUser } = require("../controllers/UserController");
const {
  acceptOrder,
  completeOrder,
  createOrderForGig,
  bidUpdate,
  fetchClientOrders,
  fetchFreelancerOrders,
  EditOrder,
} = require("../controllers/OrderController");

OrderRouter.post("/createOrderForGig", WrapAsync(createOrderForGig));
OrderRouter.get("/acceptOrder/:orderId", WrapAsync(acceptOrder));
OrderRouter.post("/completeOrder", WrapAsync(completeOrder));
OrderRouter.patch("/updateBid", WrapAsync(bidUpdate));
OrderRouter.post("/fetchClientOrders", WrapAsync(fetchClientOrders));
OrderRouter.post("/fetchFreelancerOrders", WrapAsync(fetchFreelancerOrders));
OrderRouter.put("/edit", WrapAsync(EditOrder));
module.exports = OrderRouter;
