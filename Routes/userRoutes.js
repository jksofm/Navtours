const express = require('express');
const userController = require('../Controllers/userController');
const authController = require('../Controllers/authController');

const router = express.Router();

const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getOneUser,
  updateMyData,
  deleteMydata,
} = userController;

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);

//Middlware để protect
router.use(authController.protect);


router.patch(
  '/updatepassword',
//   authController.protect,
  authController.updatePassword
);

router.patch('/updatemydata',userController.uploadMyPhoto, userController.uploadMyPhotoResize,updateMyData);
router.delete('/deletemydata', deleteMydata);
router.get(
  '/mydata',
 
  userController.getMyData,
  userController.getOneUser
);
///Midllware để giới hạn quyền admin
router.use(authController.restrictTo("admin"));

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').patch(updateUser).delete(deleteUser).get(getOneUser);

module.exports = router;
