const express = require("express");
const UserRouter = express.Router();
const jwt = require("jsonwebtoken");
const upload = require("../utils/Multer.js");
const { uploadProfilePicture } = require("../utils/FileUpload.js");
const WrapAsync = require("../utils/WrapAsync.js");
const {
  RegisterUser,
  LoginUser,
  FetchProfile,
} = require("../controllers/UserController.js");
const { User } = require("../utils/InitializeModels.js");

UserRouter.post("/createAccount", WrapAsync(RegisterUser));
UserRouter.post("/login", WrapAsync(LoginUser));
UserRouter.post(
  "/uploadPicture",
  upload.single("picture"),
  uploadProfilePicture,
  async (req, res, next) => {
    const { user_id } = req.body;
    try {
      await User.update(
        { profilePic: req.profileUrl },
        {
          where: {
            user_id,
          },
        }
      );
    } catch (e) {
      next(e);
    }
  }
);
UserRouter.get("/fetchProfile", WrapAsync(FetchProfile));
module.exports = UserRouter;
