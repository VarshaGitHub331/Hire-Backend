const { Review, Freelancer_Ratings } = require("../utils/InitializeModels.js");
const createFreelancerReview = async (req, res, next) => {
  const { reviewer_id, reviewee_id, order_id, comment, rating } = req.body;
  const review = await Review.create({
    reviewer_id,
    reviewee_id,
    order_id,
    rating,
    comment,
  });
  const freelancerRating = await Freelancer_Ratings.findOne(
    {
      where: { freelancer_id: reviewee_id },
    },
    { raw: true }
  );
  if (freelancerRating) {
    const newTotal = freelancerRating.total_rating + rating;
    const newCount = freelancerRating.rating_count + 1;
    await freelancerRating.update({
      total_rating: newTotal,
      rating_count: newCount,
    });
  } else {
    const freelancerRating = await Freelancer_Ratings.create({
      freelancer_id: reviewee_id,
      total_rating: rating,
      rating_count: 1,
    });
    console.log(freelancerRating);
  }
  return res.status(200).json(review);
};

module.exports = { createFreelancerReview };
