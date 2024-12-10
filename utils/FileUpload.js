const cloudinary = require("./Cloudinary");
const fs = require("fs");

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json("No file uploaded");
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "resumes", // Save in Cloudinary folder
      resource_type: "raw", // Upload as raw file (non-image)
    });

    // Save Cloudinary URL in request object to use in further processing
    req.resumeUrl = result.secure_url;

    // Delete file from local storage after upload to Cloudinary
    fs.unlinkSync(req.file.path);

    next(); // Proceed to the next middleware or route handler
  } catch (e) {
    next(e);
  }
};
const uploadGigMedia = async (req, res, next) => {
  try {
    if (!req.files) {
      return res.status(400).json("Non file uploaded");
    }
    let result = [];
    for (file of req.files) {
      const res = await cloudinary.uploader.upload(file.path, {
        folder: "Gigs",
        resource_type: "image",
      });
      result.push(res.secure_url);
      fs.unlinkSync(file.path);
    }
    req.body.gigFiles = result;
    next();
  } catch (e) {
    res.status(400).json("Error in cloudinary ");
  }
};
module.exports = { uploadResume, uploadGigMedia };
