const express = require('express');
const tourController = require('../Controllers/tourController');
const authController = require('../Controllers/authController');
// const reviewController = require("../Controllers/reviewController");
const reviewRouter = require('../Routes/reviewRoutes');

const router = express.Router();

/// Controllers
const {
  getAllTours,
  createTour,
  deleteTour,
  updateTour,
  getOneTour,
  checkID,
  checkBody,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  resizeTourImages,
  uploadTourImages
} = tourController;

router.use('/:tourId/reviews', reviewRouter);

//Middleware local
// router.param("id",checkID)

////Route
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide',"guide"),
    getMonthlyPlan
  );
router.route('/tours-within/:distance/position/:latlng/:unit').get(getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    createTour
  );
router
  .route('/:id')
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    deleteTour
  )
  .get(getOneTour);

module.exports = router;
