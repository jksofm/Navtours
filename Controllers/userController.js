const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//      destination :  (req,file,cb) =>{
//       cb(null,"public/img/users")
//      },
//      filename : (req,file,cb)=>{
//       //user-userid-current timestamp
//       const ext = file.mimetype.split("/")[1];
//       cb(null,`user-${req.user.id}-${Date.now()}.${ext}`)
//      }
// })
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 404), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadMyPhotoResize = catchAsync(async(req, res, next) => {
if (!req.file){
    return next();
  }

req.file.filename= `user--${req.user.id}-${Date.now()}.jpeg`

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`)

  next();
});
exports.uploadMyPhoto = upload.single('photo');
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((keyname) => {
    if (allowedFields.includes(keyname)) {
      newObj[keyname] = obj[keyname];
    }
  });
  return newObj;
};
exports.getMyData = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMyData = catchAsync(async (req, res, next) => {
  //1 . Create error if user posts pasword dât
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for pasword updates.Please use updatePassword',
        400
      )
    );
  }

  //2. Update user documentii
  //filter fields that is not allowed to change
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  console.log(updatedUser);

  res.status(200).json({
    status: 'success',
    data: {
      newUser: updatedUser,
    },
  });
});
exports.deleteMydata = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = factory.getAll(User);
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet. Please use sign up',
  });
};
exports.updateUser = factory.updateOne(User);
exports.getOneUser = factory.getOne(User);

exports.deleteUser = factory.deleteOne(User);
