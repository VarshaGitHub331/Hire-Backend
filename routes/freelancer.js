const express = require("express");

const {
  UpdateProfile,
  UpdateCategories,
  AddSkills,
  BidPosting,
  BidDetails,
  insertFoundSkills,
  CreateGig,
  AddGigSkills,
  profileUserWithAI,
  updateCategories,
  updateSkills,
  mapResumeSkills,
  getFreelancerRatingsGrowth,
  getFreelacerOrdersGrowth,
  JobsForFreelancer,
  fetchFreelancerProfile,
  fetchFreelancerReviews,
} = require("../controllers/FreelancerController");
const {
  extractSkills,
  findSimilarSkills,
  findSimilarCategories,
  extractGigTitle,
} = require("../controllers/AIControllers");
const { FetchSkills } = require("../controllers/DataController");
const { AuthUser } = require("../controllers/UserController");
const WrapAsync = require("../utils/WrapAsync");
const FreelancerRouter = express.Router();
const upload = require("../utils/Multer");
const { uploadResume, uploadGigMedia } = require("../utils/FileUpload");
const { Freelancer } = require("../utils/InitializeModels");
FreelancerRouter.post("/updateProfile", UpdateProfile);
FreelancerRouter.post(
  "/updateCategories",
  AuthUser,
  WrapAsync(UpdateCategories)
);
FreelancerRouter.post("/addSkills", AuthUser, WrapAsync(AddSkills));
FreelancerRouter.post(
  "/bidPosting",
  AuthUser,
  WrapAsync(BidPosting),
  WrapAsync(BidDetails)
);
FreelancerRouter.post(
  "/uploadResume",
  AuthUser,
  upload.single("resume"), // 'resume' is the name of the form field
  uploadResume, // Middleware to upload file to Cloudinary
  async (req, res) => {
    const { user_id } = req.body;
    if (!req.resumeUrl) {
      res.status(400).json("No such file has been uploaded");
    }
    try {
      await Freelancer.update(
        { resume: req.resumeUrl },
        {
          where: {
            user_id: user_id,
          },
        }
      );
    } catch (e) {
      next(e);
    }
    // Send back the Cloudinary URL
    res.status(200).json({
      message: "Resume uploaded successfully!",
      resumeUrl: req.resumeUrl, // Cloudinary URL of the uploaded file
    });
  }
);

FreelancerRouter.get(
  "/profileUser",
  AuthUser,
  WrapAsync(extractSkills),
  WrapAsync(findSimilarSkills),
  WrapAsync(insertFoundSkills)
);

FreelancerRouter.post(
  "/recommendCategories",
  AuthUser,
  WrapAsync(extractSkills),
  WrapAsync(findSimilarCategories)
);
FreelancerRouter.post(
  "/getGigInfo",
  AuthUser,
  WrapAsync(extractGigTitle),
  WrapAsync(extractSkills),
  WrapAsync(findSimilarCategories),
  WrapAsync(FetchSkills)
);
FreelancerRouter.post(
  "/makeGig",
  AuthUser,
  upload.array("gigImages", 5),
  uploadGigMedia,
  CreateGig,
  AddGigSkills
);
FreelancerRouter.post(
  "/profileUserWithAI",
  AuthUser,
  profileUserWithAI,
  mapResumeSkills
);
FreelancerRouter.post("/updateCategories", AuthUser, updateCategories);
FreelancerRouter.post("/updateSkills", AuthUser, updateSkills);
FreelancerRouter.get(
  "/getFreelancerRatingsGrowth",
  AuthUser,
  getFreelancerRatingsGrowth
);
FreelancerRouter.get(
  "/getFreelancerOrdersGrowth",
  AuthUser,
  getFreelacerOrdersGrowth
);
FreelancerRouter.get("/jobsForFreelancer", AuthUser, JobsForFreelancer);
FreelancerRouter.get(
  "/fetchFreelancerProfile",
  AuthUser,
  fetchFreelancerProfile
);
FreelancerRouter.get(
  "/fetchFreelancerReviews",
  AuthUser,
  WrapAsync(fetchFreelancerReviews)
);
module.exports = FreelancerRouter;
