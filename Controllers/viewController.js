const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Review = require('../models/reviewModel');


exports.alerts = (req,res,next)=>{
  const {alert} = req.query;
   if(alert==="booking"){
    res.locals.alert = "Your booking was successfully! Please check your email for a confirmation. If your booking doesn't show up here immidiately, please come back later."
   }
   next();
}
exports.getOverview = catchAsync(async (req, res) => {
  //1) Get tour data from collection
  const tours = await Tour.find();

  //2) Build template

  //3) Render Template

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getDetailTour = catchAsync(async (req, res, next) => {
  //  console.log(req.user)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
  if(req.user){

    const booking = await Booking.find({ user: req.user.id, tour: tour.id });
    // console.log("This is booking",booking);
    if(booking){ 
      return res.status(200).render('tour', {
        title: tour.name,
        tour,
        booking
      });
    }
  }

  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLoginPage = (req, res) => {
  res
    .status(200)
    // .set(
    // 'Content-Security-Policy',
    // "content-src 'self' https://cdnjs.cloudflare.com")
    .render('login', {
      title: 'Log into your account',
    });
};

exports.getRegisterPage = (req, res) => {
  res.status(200).render('register', {
    title: 'Sign up',
  });
};
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Account',
  });
};

exports.getMyTour = catchAsync(async(req, res) => {
  const bookings = await Booking.find({user : req.user.id})

  const tourIDs = bookings.map(el=>el.tour)

  const tours = await Tour.find({_id : {$in : tourIDs}});

  res.status(200).render('overview',{
     title : "My Tours",
     tours
  })
})
exports.getMyReview = catchAsync(async(req, res) => {
  const reviews = await Review.find({user : req.user.id}).populate({
    path : "tour",
    select : "name imageCover summary"
  })
  console.log("reivew: ",reviews);
  res.status(200).render('review',{
    title : "My Reviews",
    reviews
 })
  

  // const bookings = await Booking.find({user : req.user.id})
  
})

// // Update form mà ko sử dụng API
// exports.updateMyData = catchAsync(async (req, res, next) => {
//   const userUpdated = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       name: req.body.name,
//       email: req.body.email,
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
//   res.status(200).render('account', {
//     title: 'Account',
//     user : userUpdated
//   });

// });
