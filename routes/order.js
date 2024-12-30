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
} = require("../controllers/OrderController");

OrderRouter.post("/createOrderForGig", WrapAsync(createOrderForGig));
OrderRouter.get("/acceptOrder/:orderId", WrapAsync(acceptOrder));
OrderRouter.post("/completeOrder", WrapAsync(completeOrder));
OrderRouter.patch("/updateBid", WrapAsync(bidUpdate));
OrderRouter.get("/fetchOrders", WrapAsync(fetchClientOrders));
module.exports = OrderRouter;
