const Tour = require('./../models/tourModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const Booking = require("../models/bookingModel")

exports.createProduct = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourID);

  const product = await stripe.products.create({
    name: `${tour.name} Tour`,
    images: [
      'https://i.pinimg.com/564x/d6/b9/ad/d6b9ad9719e6582c5924cfa23faca768.jpg',
    ],
    description: tour.summary,
  });
 
  res.status(200).json({
    product: product,
  });

  
  
});
exports.createPrice = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourID);

  const price = await stripe.prices.create({
    unit_amount: tour.price * 100,
    currency: 'usd',
    recurring: { interval: 'month' },
    product: `${req.params.productId}`,
  });
  res.status(200).json({
    price,
  });
});

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1Get the currently booked tour
  const tour = await Tour.findById(req.params.tourID);

  //2 Create  checkout session
  let YOUR_DOMAIN;
  if (process.NODE_ENV === 'production') {
    YOUR_DOMAIN = `${req.protocol}://${req.get('host')}`;
  }
  YOUR_DOMAIN = 'http://localhost:3000';
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell

        price: req.params.priceId,

        quantity: 1,
      },
    ],
    mode: 'subscription',
    currency: 'usd',
    success_url: `${YOUR_DOMAIN}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}&startDateId=${req.params.startDateId}`,
    cancel_url: `${YOUR_DOMAIN}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    payment_method_types: ['card'],
  });

  //Create session as response
//   res.redirect(303, session.url);
  res.status(200).json({
    session,
  });
});

exports.createBookingCheckout = catchAsync(async(req,res,next)=>{

    const {tour,user,price,startDateId} = req.query;
    if(!tour && !user && !price && !startDateId) return next();
    const bookingExist = await Booking.find({user:user,tour:tour,dateChoose:startDateId});
    if(bookingExist){
     
      return next(new AppError("You have already booked this tour ! Please choose another day or another tour !",400))
      
    }
     await Booking.create({tour,user,price,dateChoose: startDateId});

     res.redirect(req.originalUrl.split('?')[0]);
})

exports.createBooking = factory.createOne(Booking)

exports.getBooking = factory.getOne(Booking)
exports.getAllBooking = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)





