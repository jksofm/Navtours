const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

const { promisify } = require('util');
const signToken = (id) => {
  return jwt.sign(
    {
      id: id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COKKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true, // cookie cannot be modified or accessed by an actions
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true; ///Nếu không phải là https thì sẽ không có cookie
  }
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  let url;
  url = `${req.protocol}://localhost:3000/mydata`;
  if (process.env.NODE_ENV === 'production') {
    url = `${req.protocol}://${req.get('host')}/mydata`;
  }
  await new Email(newUser, url).sendWelcome();
  //   const token = signToken(newUser._id);

  //   res.status(201).json({
  //     status: 'success',
  //     token,
  //     data: {
  //       user: newUser,
  //     },
  //   });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //checkiff exits
  if (!email || !password) {
    return next(new AppError(`Please provide email and pasword!`, 400));
  }

  //check user exits && check password
  const user = await User.findOne({ email: email }).select('+password'); // Dựa vào email đi lấy về dữ liệu và lấy ra dữ liêu passwprd bị ẩn
 
  if (!user) {
    return next(new AppError('Incorect email or password'), 404);
  }
  const correct = await user.correctPassword(password, user.password);
  if (!correct) {
    return next(new AppError('Incorect email or password'), 404);
  }

  //send token to client
  //   const token = signToken(user._id);
  //   res.status(200).json({
  //     status: 'success',
  //     token,
  //     data:{
  //         user
  //     }
  //   });

  createSendToken(user, 200, res);
});
exports.logout = (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  //1)Get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // console.log(token);
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access'),
      404
    );
  }

  //2) Validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
 
  //Sử dụng prosimify của util để tạo ra một promise

  //3) chec if user still exists when someone have your token
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('User not found! Please login again'), 404);
  }

  //4)) check if user changed password after token was issude
  if (freshUser.changedPassword(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again'),
      401
    );
  }

  req.user = freshUser;
  res.locals.user = freshUser;

  next();
});
/// Only for render pages, no errors
exports.isLogin = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //1 verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
    
      //Sử dụng prosimify của util để tạo ra một promise

      //3) chec if user still exists when someone have your token
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }

      //4)) check if user changed password after token was issude
      if (freshUser.changedPassword(decoded.iat)) {
        return next();
      }

      ///There is a logged in user
      ///Res.locals sẽ tạo ra một biến global
      res.locals.user = freshUser;
      req.user = freshUser;

      return next();
    } catch (e) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    ////Vì protect chạy trước restrictTo nên nó truyền lại req.user cho restrict
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You donot have permission to perform this action', 403)
      );
    }

    next();
  });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) get User based on Posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email'), 404);
  }

  //2) Generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
 

  //3) Send it to user's email

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetpassword/${resetToken}`;

    await new Email(user, resetURL).sendResetPassword();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (e) {
  
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending Email', 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1. Get user base on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2) if token has not expired, and there is user set the new password

  if (!user) {
    return next(new AppError('Token has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  //3) Update changed Pasword at property for the user

  //4) log the userIn send JWT

  //   const token = signToken(user._id);
  //   res.status(200).json({
  //     status: 'success',
  //     token,
  //     data : {
  //         user
  //     }
  //   });
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  ///1)Get user from collection
 
  const user = await User.findById(req.user.id).select('+password');

  //2)Checkiff current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  //3)Update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPassword;
  await user.save();
  //Ta không thể sử dụng update bởi vị validator cho confirmPassword không áp dụng cho update và middlware cho save cũng không chạy được

  //4)Log user in, send JWT
  //   const token = signToken(user._id);

  //   res.status(201).json({
  //     status: 'success',
  //     token,
  //     data: {
  //         user
  //     }

  //   });
  createSendToken(user, 201, res);
});
