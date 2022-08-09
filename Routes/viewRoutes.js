const express = require('express');
const viewController = require("../Controllers/viewController");
const authController = require('../Controllers/authController');
const bookingController = require('../Controllers/bookingController');



const router = express.Router();

router.get('/mydata',authController.protect,viewController.getAccount);
router.get('/mytour',authController.protect,viewController.getMyTour);
router.get('/myreview',authController.protect,viewController.getMyReview);





router.get('/',bookingController.createBookingCheckout,authController.isLogin,viewController.getOverview)
router.use(authController.isLogin);
router.get('/tour/:slug',viewController.getDetailTour)
// router.get('/tour/:slug',viewController.getDetailTour)
router.get('/login',viewController.getLoginPage);

router.get('/register',viewController.getRegisterPage);






//Update form mà ko sử dụng API
// router.post('/submit-user-data',authController.protect,viewController.updateMyData);





module.exports  = router;