const express = require('express');
const morgan = require('morgan');
const path = require('path');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const viewRouter = require('./Routes/viewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const bookingRouter = require('./Routes/bookingRoutes')
var csp = require('express-csp');
const compression = require('compression');
const cors = require('cors');


const app = express();

app.enable('trust proxy');


app.set("view engine","pug");
app.set("views",path.join(__dirname, 'views'));
app.use(cors());
// app.use(cors({
//   origin : "https://www.natours.com"
// }))

app.options('*',cors());

//Static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));





//midleware
//set security headers HTTP
// app.use(helmet());
// csp.extend(app, {
//   policy: {
//     directives: {
//       'default-src': ['self'],
//       'style-src': ['self', 'unsafe-inline', 'https:'],
//       'font-src': ['self', 'https://fonts.gstatic.com'],
//       'script-src': [
//         'self',
//         'unsafe-inline',
//         'data',
//         'blob',
//         'https://js.stripe.com',
//         'https://*.mapbox.com',
//         'https://*.cloudflare.com/',
//         'https://bundle.js:8828',
//         'wss://localhost:56558/',
//       ],
//       'worker-src': [
//         'self',
//         'unsafe-inline',
//         'data:',
//         'blob:',
//         'https://*.stripe.com',
//         'https://*.mapbox.com',
//         'https://*.cloudflare.com/',
//         'https://bundle.js:*',
//         'ws://localhost:*/',
//       ],
//       'frame-src': [
//         'self',
//         'unsafe-inline',
//         'data:',
//         'blob:',
//         'https://*.stripe.com',
//         'https://*.mapbox.com',
//         'https://*.cloudflare.com/',
//         'https://bundle.js:*',
//         'ws://localhost:*/',
//       ],
//       'img-src': [
//         'self',
//         'unsafe-inline',
//         'data:',
//         'blob:',
//         'https://*.stripe.com',
//         'https://*.mapbox.com',
//         'https://*.cloudflare.com/',
//         'https://bundle.js:*',
//         'ws://localhost:*/',
//       ],
//       'connect-src': [
//         'self',
//         'unsafe-inline',
//         'data:',
//         'blob:',
//         'wss://<HEROKU-SUBDOMAIN>.herokuapp.com:<PORT>/',
//         'https://*.stripe.com',
//         'https://*.mapbox.com',
//         'https://*.cloudflare.com/',
//         'https://bundle.js:*',
//         'wss://localhost:*/',
//         'ws://localhost:*/',

//       ],
//     },
//   },
// });

app.use(compression());

/// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//Body parser data
app.use(
  express.json({
    limit: '10kb',
  })
);
//POST method
app.use(express.urlencoded({
    extended: true,
    limit : "10kb"
}))/// xử lí hành vi của form
app.use(cookieParser());
//Data saniitization against NoSQL query injection
// app.use(mongoSanitize());

// Data saniitization against XSS wwhen someone try to send html or jvs in data
app.use(xss());
//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      "price"
    ],
  })
);



///middlware dùng để hạn chế số lượng request trong 1h
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP,please try again in an hour!',
});
app.use('/api', limiter);

// app.use((req, res, next) => {
//   console.log(req.cookies);
//   next();
// });
// app.use((req, res, next) => {
//   console.log('hello from the middleware 2');

//   req.requestTime = new Date().toISOString();
//   next();
// });

//Router Handler

//Router
// const tourRouter = express.Router();
// const userRouter = express.Router();
app.use('/', viewRouter);


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);




app.all('*', function (req, res, next) {
  //  res.status(404).json({
  //   status : "fail",
  //   message : `Cannot find ${req.originalUrl} on this server!`
  // })
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);
// tourRouter.route('/').get(getAllTours).post(createTour);
// tourRouter.route('/:id').patch(updateTour).delete(deleteTour).get(getOneTour);

// userRouter.route('/').get(getAllUsers).post(createUser);
// userRouter.route('/:id').patch(updateUser).delete(deleteUser).get(getOneUser);
// app.get('/api/v1/tours',getAllTours);

// app.get('/api/v1/tours/:id', getOneTour);

// app.post('/api/v1/tours', createTour);

// app.patch("/api/v1/tours/:id",updateTour)

// app.delete("/api/v1/tours/:id",deleteTour)

module.exports = app;
