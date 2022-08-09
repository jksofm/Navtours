const express = require('express');
const reviewController = require('../Controllers/reviewController');
const authController = require('../Controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect)
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
   
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.checkIfBooked,

    reviewController.createOneReview
  );

router
  .route('/:id')
  .delete(authController.restrictTo('user',"admin"),reviewController.deleteReview)
  .patch(authController.restrictTo('user',"admin"),reviewController.updateReview)
  .get(reviewController.getReview);

module.exports = router;
