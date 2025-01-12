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
  RejectOrder,
  getOrder,
  AddTask,
  CompleteTask,
  updateDescription,
} = require("../controllers/OrderController");
const Order = require("../models/Order");

OrderRouter.post("/createOrderForGig", WrapAsync(createOrderForGig));
OrderRouter.get("/acceptOrder/:orderId", WrapAsync(acceptOrder));
OrderRouter.get("/rejectOrder/:orderId", WrapAsync(RejectOrder));
OrderRouter.post("/completeOrder", WrapAsync(completeOrder));
OrderRouter.patch("/updateBid", WrapAsync(bidUpdate));
OrderRouter.post("/fetchClientOrders", WrapAsync(fetchClientOrders));
OrderRouter.post("/fetchFreelancerOrders", WrapAsync(fetchFreelancerOrders));
OrderRouter.put("/edit", WrapAsync(EditOrder));
OrderRouter.get("/getOrder/:orderId", WrapAsync(getOrder));
OrderRouter.post("/addTask", WrapAsync(AddTask));
OrderRouter.post("/completeTask", WrapAsync(CompleteTask));
OrderRouter.post("/updateTask", WrapAsync(updateDescription));

module.exports = OrderRouter;
