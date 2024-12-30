const {
  Job_Postings,
  User,
  Order,
  Bids,
  Client,
} = require("../utils/InitializeModels.js");
const { sendMail } = require("../utils/Mail.js");
console.log("Checking modles From ORDER");
console.log(Job_Postings);
console.log(User);
console.log(Bids);
console.log(Order);
const createOrderForGig = async (req, res, next) => {
  const { gig_id, user_id, freelancer_id } = req.body;
  const order = await Order.create({
    gig_id,
    creator: user_id,
    acceptor: freelancer_id,
    status: "created",
  });
  const freelancer = await User.findOne({
    attributes: ["email"],
    where: { user_id: freelancer_id },
    raw: true,
  });
  const client = await User.findOne({
    attributes: ["first_name"],
    where: { user_id: user_id },
    raw: true,
  });
  sendMail(
    freelancer.email,
    order.order_id,
    "Client Request For Order Placement",
    `${client.first_name} wants to place an order with you`
  )
    .then(() => console.log("Email sent"))
    .catch((err) => console.error("Error sending email:", err));
};
const acceptOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Update the order status to 'accepted'
    const order = await Order.update(
      { status: "accepted" },
      { where: { order_id: orderId } }
    );

    if (order) {
      res.status(200).send("Order accepted successfully.");
    } else {
      res.status(404).send("Order not found.");
    }
  } catch (error) {
    console.error("Error accepting order: ", error);
    res.status(500).send("Failed to accept order.");
  }
};
const completeOrder = async (req, res, next) => {
  const { orderId } = req.body;
  try {
    const order = await Order.update(
      { status: "complete" },
      { where: { order_id: orderId } }
    );
    if (order) {
      res.status(200).send("Order completed successfully");
    } else {
      res.status(404).json("No order exists");
    }
  } catch (e) {
    next(e);
  }
};
const bidUpdate = async (req, res, next) => {
  console.log("I was called");
  console.log(Bids);
  const { bidId } = req.body; // Extract bidId from the request body
  try {
    const bid = await Bids.findByPk(bidId);
    if (bid) {
      bid.bid_status = "accepted";
      await bid.save();
      res.status(200).send("Bid updated successfully");
    } else {
      res.status(404).json("No such bid exists or update not needed");
    }
  } catch (e) {
    next(e); // Pass any errors to the error handling middleware
  }
};
const fetchClientOrders = async (req, res, next) => {
  const orders=await 
};
module.exports = {
  acceptOrder,
  completeOrder,
  bidUpdate,
  createOrderForGig,
  fetchClientOrders,
};
