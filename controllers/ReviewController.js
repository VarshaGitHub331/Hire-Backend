const {
  Review,
  Freelancer_Ratings,
  Client_Ratings,
} = require("../utils/InitializeModels.js");
const createReview = async (req, res, next) => {
  console.log(req.body);
  const { reviewer_id, reviewee_id, order_id, comment, rating, role } =
    req.body;
  const review = await Review.create({
    reviewer_id,
    reviewee_id,
    order_id,
    rating,
    comment,
  });
  if (role == "client") {
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
  } else {
    const clientRating = await Client_Ratings.findOne(
      {
        where: { client_id: reviewee_id },
      },
      {
        raw: true,
      }
    );
    if (clientRating) {
      const newTotal = clientRating.total_rating + total;
      const newCount = clientRating.rating_count + 1;
      await clientRating.update({
        total_rating: newTotal,
        rating_count: newCount,
      });
    } else {
      await Client_Ratings.create({
        client_id: parseInt(reviewee_id),
        total_rating: rating,
        rating_count: 1,
      });
    }
  }
  return res.status(200).json(review);
};

module.exports = { createReview };
