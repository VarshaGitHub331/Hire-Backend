const express = require("express");
const { Conversation, User } = require("../utils/InitializeModels");
const sequelize = require("sequelize");
const conversationRouter = express.Router();

conversationRouter.get("/chats", async (req, res, next) => {
  const { user_id, role } = req.body; // Use query params for GET request

  const results = [];

  try {
    // Fetch conversations where the user is either the buyer or the seller
    const conversations = await Conversation.findAll({
      where: {
        [sequelize.Op.or]: [{ buyer_id: user_id }, { seller_id: user_id }],
      },
      raw: true,
    });
    console.log(conversations);
    if (conversations.length > 0) {
      for (const conversation of conversations) {
        const otherUserId =
          conversation.buyer_id === user_id
            ? conversation.seller_id
            : conversation.buyer_id;

        // Fetch the other user's name (buyer or seller depending on who is the other user)
        const otherUser = await User.findOne({
          where: {
            user_id: otherUserId,
          },
          attributes: ["first_name", "last_name"], // Fetch first and last name
          raw: true,
        });

        // Add the conversation data along with the other user's details
        results.push({
          conversation_id: conversation.conversation_id,
          user_id: user_id,
          other_user_id: otherUserId,
          other_user_name: `${otherUser.first_name} ${otherUser.last_name}`, // Full name
          role: conversation.buyer_id === user_id ? "buyer" : "seller", // Determine the role of the user in this conversation
        });
      }
      res.json({ conversations: results });
    } else {
      res.json({ message: "No conversations found for this user." });
    }
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = conversationRouter;
