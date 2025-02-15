const express = require("express");
const socketIo = require("socket.io");
const http = require("http");
const cors = require("cors");
const app = express();
const server = http.createServer(app);

// Set up Socket.IO with CORS support for cross-origin requests
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend origin
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);
});

console.log("Socket.IO server is running on port 3001");

// CORS setup for Express HTTP routes - Allow all HTTP methods
const corsOptions = {
  origin: "http://localhost:3000", // Allow only requests from this origin
  methods: "*", // Allow all HTTP methodsWWW
  credentials: true, // Enable credentials for HTTP requests
};

// Apply CORS middleware for Express routes
app.use(cors(corsOptions));

// Middleware for parsing incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importing and using routes
const UserRouter = require("./routes/user.js");
const FreelancerRouter = require("./routes/freelancer.js");
const ClientRouter = require("./routes/client.js");
const OrderRouter = require("./routes/order.js");
const dataRouter = require("./routes/Data.js");
const gigRouter = require("./routes/gigs.js");
const conversationRouter = require("./routes/Conversation.js");
const reviewRouter = require("./routes/review.js");
const ApplicantRouter = require("./routes/Applicant.js");
app.use("/user", UserRouter);
app.use("/freelancer", FreelancerRouter);
app.use("/client", ClientRouter);
app.use("/order", OrderRouter);
app.use("/data", dataRouter);
app.use("/gigs", gigRouter);
app.use("/conversation", conversationRouter);
app.use("/reviews", reviewRouter);
app.use("/applicants", ApplicantRouter);
// Start the server
server.listen(3001, () => {
  console.log("Server listening at http://localhost:3001");
});

module.exports = { io }; // Exporting io for use in other parts of your application
require("./utils/Chat.js");
