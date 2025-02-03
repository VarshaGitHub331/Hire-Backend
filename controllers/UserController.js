const {
  User,
  Freelancer,
  Client,
  Order,
} = require("../utils/InitializeModels");
require("dotenv").config(); // Load environment variables from .env file

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
async function HashPassword(password) {
  try {
    const SaltRound = 10;
    const hashPassword = await bcrypt.hash(password, SaltRound);
    return hashPassword;
  } catch (e) {
    console.log(e);
  }
}
const RegisterUser = async (req, res, next) => {
  console.log("REGISTERING USER");
  try {
    const { email, first_name, last_name, role, password } = req.body;
    console.log(req.body);
    const hashPassword = await HashPassword(password);
    console.log(hashPassword);
    const newUser = await User.create({
      email: email,
      first_name,
      last_name,
      password: hashPassword,
      role,
    });
    if (role === "freelancer") {
      const newFreelancer = await Freelancer.create({
        user_id: newUser.user_id,
        resume: " ",
        profile: " ",
        cost: 0,
      });
    } else if (role === "client") {
      const { company_name } = req.body;
      const newClient = await Client.create({
        user_id: newUser.user_id,
        company_name,
        contact_email: email,
      });
    }
    const user = {
      id: newUser.user_id,
      user_name: first_name,
      user_id: newUser.user_id,
      role: newUser.role,
    };
    const SECRET_KEY = process.env.JWT_SECRET;
    const token = jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });
    res.status(200).json(token);
  } catch (e) {
    next(e);
  }
};
const LoginUser = async (req, res, next) => {
  console.log("called login");
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({
      where: { email: "varsha@sud" },
      attributes: [
        "user_id",
        "email",
        "first_name",
        "last_name",
        "password",
        "role",
        "created_at",
        "updated_at",
      ],
      raw: true,
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" }); // Avoid revealing if user exists
    }

    // Compare the password
    const isValid = await bcrypt.compare(password, user.password);
    console.log(user);
    if (isValid) {
      // Generate JWT token
      const token = jwt.sign(
        { user_id: user.user_id, user_name: user.first_name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      return res.status(200).json({ token });
    } else {
      return res.status(401).json({ error: "Invalid credentials" }); // Generic error message
    }
  } catch (e) {
    console.error("Login error:", e); // Log the actual error for debugging
    return next(e); // Pass error to error handling middleware
  }
};

const AuthUser = async (req, res, next) => {
  const token = req.header("Authorization").split(" ")[1];
  console.log(token);
  console.log(req.body);
  console.log("The header");
  console.log(req.header("Authorization"));
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send("Invalid token");
    }
    console.log("I A HERE");
    console.log(decoded);
    next();
  });
};
const FetchProfile = async (req, res, next) => {
  console.log("Here for fetching profile");
  console.log(req.query);
  const { user_id, role } = req.query;
  if (role == "freelancer") {
    const fetchedUser = await User.findOne({
      attributes: [
        "first_name",
        "last_name",
        "email",
        "role",
        "created_at",
        "updated_at",
      ],
      where: {
        user_id,
      },
      raw: true,
    });
    const freelancerDetails = await Freelancer.findOne({
      where: {
        user_id,
      },
      raw: true,
    });
    const completedOrders = await Order.count({
      where: {
        acceptor: user_id,
        status: "Complete",
      },
    });
    const progressingOrder = await Order.count({
      where: {
        acceptor: user_id,
        status: "Accepted",
      },
    });
    console.log(fetchedUser);
    console.log(freelancerDetails);
    console.log(completedOrders);
    console.log(progressingOrder);
    res.status(201).json({
      UserDetails: fetchedUser,
      FrelancerDetails: freelancerDetails,
      completedOrders: completedOrders,
      progressingOrder: progressingOrder,
    });
  } else {
  }
};
module.exports = { RegisterUser, LoginUser, AuthUser, FetchProfile };
