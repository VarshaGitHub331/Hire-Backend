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
  updateUserProfile,
  AuthUser,
} = require("../controllers/UserController.js");
const { User } = require("../utils/InitializeModels.js");

UserRouter.post("/createAccount", WrapAsync(RegisterUser));
UserRouter.post("/login", WrapAsync(LoginUser));
UserRouter.post(
  "/uploadPicture",
  AuthUser,
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
      res.status(200).json(req.profileUrl);
    } catch (e) {
      next(e);
    }
  }
);
UserRouter.get("/fetchProfile", AuthUser, WrapAsync(FetchProfile));
UserRouter.post("/updateUserProfile", AuthUser, WrapAsync(updateUserProfile));
module.exports = UserRouter;
