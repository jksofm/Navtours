const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory');

// exports.getAllReviews = catchAsync(async (req,res,next)=>{
//     let filter = {};
//      if(req.params.tourId){
//         filter = {tour : req.params.tourId};
//      }
//     const reviews = await Review.find(filter);

//     res.status(200).json({
//         status : "success",
//         results : reviews.length,
//         data :{
//             reviews,
//         }
//     })
// })
exports.getAllReviews = factory.getAll(Review);


exports.createOneReview = factory.createOne(Review);

exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);

exports.getReview = factory.getOne(Review);
exports.setTourUserIds = (req, res, next) =>{
  ////Allow nested routes
      ///Từ param truyền xuống 
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
  
    //// từ protected route truyền qua
    next();
  }
exports.checkIfBooked = catchAsync(async (req, res, next) => {
  // To check if booked was bought by user who wants to review it
  const booking = await Booking.find({ user: req.body.user, tour: req.body.tour });
  if (booking.length === 0) return next(new AppError('You must buy this tour to review it', 401));
  next();
});
