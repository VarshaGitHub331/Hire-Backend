const {
  Job_Postings,
  User,
  Order,
  Bids,
  Client,
  Gigs,
} = require("../utils/InitializeModels.js");
const { sendMail } = require("../utils/Mail.js");
const { Sequelize } = require("../models");
console.log("Checking modles From ORDER");
console.log(Job_Postings);
console.log(User);
console.log(Bids);
console.log(Order);
const createOrderForGig = async (req, res, next) => {
  const { gig_id, user_id, freelancer_id, payable, notes } = req.body;
  const order = await Order.create({
    gig_id,
    creator: user_id,
    acceptor: freelancer_id,
    status: "created",
    payable,
    notes,
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
    .then(() => {
      console.log("Email sent");
      return res.status(200).json("Done placing order");
    })
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
  try {
    const { user_id } = req.body;
    console.log("User is ", user_id); // Ensure user_id is in req.body

    // Fetch orders where the creator is the logged-in user (client)
    const orders = await Order.findAll({
      where: {
        creator: user_id,
      },
      attributes: [
        "order_id",
        "creator",
        "acceptor",
        "job_posting_id",
        "gig_id",
        "status",
        "payable",
        "notes",
        "createdAt",
        "updatedAt",
      ],
    });

    console.log(orders);

    // Process each order asynchronously using Promise.all to fetch freelancer name and gig duration in parallel
    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        // Get the freelancer's name by finding the user with the acceptor's id
        const freelancer = await User.findOne({
          where: { user_id: order.acceptor },
          attributes: ["first_name"],
          raw: true,
        });

        // Get the gig duration and assign it to the order
        const gig = await Gigs.findOne({
          where: { gig_id: order.gig_id },
          attributes: ["duration"],
          raw: true,
        });

        return {
          ...order.dataValues, // Spread the original order fields
          other_name: freelancer ? freelancer.first_name : "Unknown",
          duration: gig ? gig.duration : "Not Specified",
        };
      })
    );

    // Send the updated orders back as the response
    res.status(200).json(updatedOrders);
  } catch (error) {
    console.error("Error fetching client orders:", error);
    next(error); // Forward the error to the error handling middleware
  }
};
const fetchFreelancerOrders = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    console.log("User is ", user_id); // Ensure user_id is in req.body

    // Fetch orders where the creator is the logged-in user (client)
    const orders = await Order.findAll({
      where: {
        acceptor: user_id,
      },
      attributes: [
        "order_id",
        "creator",
        "acceptor",
        "job_posting_id",
        "payable",
        "notes",
        "gig_id",
        "status",
        "createdAt",
        "updatedAt",
      ],
    });

    console.log(orders);

    // Process each order asynchronously using Promise.all to fetch freelancer name and gig duration in parallel
    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        // Get the freelancer's name by finding the user with the acceptor's id
        const client = await User.findOne({
          where: { user_id: order.creator },
          attributes: ["first_name"],
          raw: true,
        });

        // Get the gig duration and assign it to the order
        const gig = await Gigs.findOne({
          where: { gig_id: order.gig_id },
          attributes: ["duration"],
          raw: true,
        });

        return {
          ...order.dataValues, // Spread the original order fields
          other_name: client ? client.first_name : "Unknown",
          duration: gig ? gig.duration : "Not Specified",
        };
      })
    );

    // Send the updated orders back as the response
    res.status(200).json(updatedOrders);
  } catch (error) {
    console.error("Error fetching client orders:", error);
    next(error); // Forward the error to the error handling middleware
  }
};
const RejectOrder = async (req, res, next) => {
  const { orderId } = req.params;
  console.log(orderId);
  console.log("CALLED FOR REJECTION");
  const order = await Order.findOne({
    attributes: ["acceptor", "creator"],
    where: { order_id: orderId, status: "created" },
    raw: true,
  });
  const orderDestroy = await Order.destroy({ where: { order_id: orderId } });
  const client = await User.findOne({
    attributes: ["email"],
    where: { user_id: order.creator },
    raw: true,
  });
  const freelancer = await User.findOne({
    attributes: ["first_name"],
    where: { user_id: order.acceptor },
    raw: true,
  });
  sendMail(
    client.email,
    order.order_id,
    "Order Has Been Declientd",
    `We are sorry to inform you that, ${freelancer.first_name} has declined your order`
  )
    .then(() => {
      console.log("Email sent");
      return res.status(200).json("Done rejecting order");
    })
    .catch((err) => console.error("Error sending email:", err));
};
const EditOrder = async (req, res, next) => {
  console.log(req.body);
  const { order_id, status } = req.body;
  await Order.update({ status: status }, { where: { order_id } });
  res.status(200).json("Edited");
};
module.exports = {
  acceptOrder,
  completeOrder,
  bidUpdate,
  createOrderForGig,
  fetchClientOrders,
  fetchFreelancerOrders,
  EditOrder,
  RejectOrder,
};
