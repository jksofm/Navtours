const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const Booking = require("../models/bookingModel");
const { EventEmitter } = require('nodemailer/lib/xoauth2');

exports.createProduct = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourID);

  const product = await stripe.products.create({
    name: `${tour.name} Tour`,
    images: [
      `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
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
    // success_url: `${YOUR_DOMAIN}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}&startDateId=${req.params.startDateId}`,
    success_url: `${req.protocol}://${req.get('host')}/mytour?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    payment_method_types: ['card'],
    // consent : req.params.startDateId
    metadata : {dateChoose : req.params.startDateId}
  });

  //Create session as response
//   res.redirect(303, session.url);
  res.status(200).json({
    session,
  });
});

// exports.createBookingCheckout = catchAsync(async(req,res,next)=>{

//     const {tour,user,price,startDateId} = req.query;
//     if(!tour && !user && !price && !startDateId) return next();
//     const bookingExist = await Booking.findOne({user,tour,dateChoose:startDateId});
//      console.log(bookingExist);
//     if(bookingExist){
     
//       return next(new AppError("You have already booked this tour ! Please choose another day or another tour !",400))
      
//     }
//      await Booking.create({tour,user,price,dateChoose: startDateId});

//      res.redirect(req.originalUrl.split('?')[0]);
// })
const createBookingCheckout = async (session)=>{
  console.log("session: ",session);
  const tour = session.client_reference_id;
  const user = (await User.findOne({email : session.customer_email})).id;
  const price = session.amount_total/100;
  const startDateId = session.metadata.dateChoose

 

  await Booking.create({tour,user,price,dateChoose: startDateId});
          
}
exports.webhookCheckout = (req,res)=>{
  const signature = req.headers['stripe-signature'];
        let event = req.body;
    try{

      event = stripe.webhooks.constructEvent(req.body,signature,process.env.STRIPE_WEBHOOK_SECRET);
    }catch(err){
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }
  
    createBookingCheckout(event.data.object);
    
    res.status(200).json({received : true})

}
exports.checkifBooked = async(req,res,next)=>{
  
    const user = req.user.id;
    const tour = req.params.tourID;
    const startDateId = req.params.startDateId;
   const bookingExist = await Booking.findOne({user,tour,dateChoose:startDateId});
   if(bookingExist){
    req.query.alert = "checkifbooking"
    location.reload(true);
    return next(new AppError("You have already booked this tour ! Please choose another day or another tour !",400))
   };
   
  
    return next();
  

}

exports.createBooking = factory.createOne(Booking)

exports.getBooking = factory.getOne(Booking)
exports.getAllBooking = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)





