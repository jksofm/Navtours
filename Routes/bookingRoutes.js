const express = require('express');
const bookingController = require('../Controllers/bookingController');
const authController = require('../Controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router.get(
  '/checkout-session/:tourID/:priceId/:startDateId',
  bookingController.getCheckoutSession
);

router.post('/create-product/:tourID', bookingController.createProduct);
router.post('/create-price/:tourID/:productId', bookingController.createPrice);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .post(bookingController.createBooking)
  .get(bookingController.getAllBooking);
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
