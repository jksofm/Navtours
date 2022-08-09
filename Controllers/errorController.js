const AppError = require('../utils/appError');
////Xử lí ID
const handleCaseErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 404);
};
///Xử lí name duplicate
const handleDuplicateFieldsDB = (err) => {
  console.log(err);

  const message = `Duplicate field value : ${err.keyValue.name},Please filed another Value`;
  return new AppError(message, 404);
};
///Xử lí validate
const handleValidationDB = (err) => {
  ///Object values sẽ lấy  tất cả những value trong errors va đưa vào mảng

  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data.(${errors.join('. ')})`;
  return new AppError(message, 400);
};
///Xử lí JWT
const handleJWTError = (err) => {
  return AppError('Invalid token. Please login again', 401);
};
///Xử lí token expired
const handleJWTExpiredError = (err) => {
  return AppError('Token has expired. Please login again', 401);
};
const prodHandleError = (err, res) => {
  if (err.isOperational) {
    return res.status(500).render('error', {
      title: 'Something went wrong',
      msg: `${err.message} Please try again`,
    });
  } else {
    // console.log("Error : ",err);
    return res.status(500).render('error', {
      title: 'Something went wrong',
      msg: 'Please try again!',
    });
  }
};

const devHandleError = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    res.status(500).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    ///Xu li ID
    if (error.kind === 'ObjectId' && error.path === '_id') {
      error = handleCaseErrorDB(error);
    }
    ///Xu li name
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    //Xử lí Validator
    if(error.errors){

      const nameValidator = Object.values(error.errors).map((el) => el.name);
      if (nameValidator[0] === 'ValidatorError') {
        error = handleValidationDB(error);
      }
    }
    //// Xử lí webtokenerrror
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    //Xử lí tokeexpired
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError(error);
    }

    prodHandleError(error, res);
  } else if (process.env.NODE_ENV === 'development') {
    devHandleError(err, req, res);
  }
};
