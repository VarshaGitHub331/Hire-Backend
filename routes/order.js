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
  getTasks,
  createOrderTimeline,
} = require("../controllers/OrderController");
const { generateTimeLine } = require("../controllers/AIControllers");
OrderRouter.post("/createOrderForGig", AuthUser, WrapAsync(createOrderForGig));
OrderRouter.get("/acceptOrder/:orderId", AuthUser, WrapAsync(acceptOrder));
OrderRouter.get("/rejectOrder/:orderId", AuthUser, WrapAsync(RejectOrder));
OrderRouter.post("/completeOrder", AuthUser, WrapAsync(completeOrder));
OrderRouter.patch("/updateBid", AuthUser, WrapAsync(bidUpdate));
OrderRouter.post("/fetchClientOrders", AuthUser, WrapAsync(fetchClientOrders));
OrderRouter.post(
  "/fetchFreelancerOrders",
  AuthUser,
  WrapAsync(fetchFreelancerOrders)
);
OrderRouter.put("/edit", AuthUser, WrapAsync(EditOrder));
OrderRouter.get("/getOrder/:orderId", AuthUser, WrapAsync(getOrder));
OrderRouter.post("/addTask", AuthUser, WrapAsync(AddTask));
OrderRouter.get("/getTasks/:orderId", AuthUser, WrapAsync(getTasks));
OrderRouter.post("/completeTask", AuthUser, WrapAsync(CompleteTask));
OrderRouter.post("/updateTask", AuthUser, WrapAsync(updateDescription));
OrderRouter.post(
  "/generateAITimeline",
  AuthUser,
  WrapAsync(generateTimeLine),
  WrapAsync(createOrderTimeline)
);
module.exports = OrderRouter;
