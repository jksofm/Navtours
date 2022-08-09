const Tour = require('./../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const Booking = require('../models/bookingModel');

const multer = require('multer');
const sharp = require('sharp');

//middleware
// checkID = (req, res, next,val) => {
//   if (val * 1 > tours.length) {
//     //we have to make sure that the function will return before next() is called
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid id',
//     });
//   }
//   next();
// }
// checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'missing info',
//     });
//   }
//   next();
// };
///controllers
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
//   );
const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
////////////////////////////////////
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
const uploadTourImages = upload.fields([
  {name : "imageCover",maxCount : 1},
  {name : "images",maxCount : 3}
]);
// upload.single("")
// upload.array("images",5);
const resizeTourImages = catchAsync(async(req, res, next) => {
  if(!req.files.imageCover || !req.files.images) return next();
///1 cover image
const imageCoverFilename = `tour--${req.params.id}-${Date.now()}.jpeg`
  await sharp(req.files.imageCover[0].buffer)
  .resize(2000, 1333)
  .toFormat('jpeg')
  .jpeg({ quality: 90 })
  .toFile(`public/img/tours/${imageCoverFilename}`)
 req.body.imageCover = imageCoverFilename;
 //2 images
 req.body.images = [];
 await Promise.all(req.files.images.map(async(file,index)=>{
  const filename =`tour--${req.params.id}-${Date.now()}-${index+1}.jpeg`
  await sharp(file.buffer)
  .resize(2000, 1333)
  .toFormat('jpeg')
  .jpeg({ quality: 90 })
  .toFile(`public/img/tours/${filename}`)
 req.body.images.push(filename);

 }))

 
  next();
})
const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    {
      $match: {
        //  _id : {
        //   $ne : "EASY"
        //  }
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    data: {
      stats,
    },
  });
});
const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', ///Tách từng phần tử trong mảng ra thành các document
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: '$startDates',
        },
        numTourStarts: { $sum: 1 }, ////Đếm mỗi lần có tour trong mỗi tháng
        tours: { $push: '$name' }, ///$push tạo thành 1 cái mảng và lấy tên của mỗi document đẩy vô
      },
    },
    {
      $addFields: {
        ////Sửa fields
        month: '$_id',
      },
    },
    {
      $project: {
        //Xóa fields
        _id: 0,
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      $limit: 12, ///Số các document
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: plan.length,

    data: {
      plan,
    },
  });
});
// const getAllTours = catchAsync(async (req, res,next) => {
//   ////Execute
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .pagination();
//   const tours = await features.query;

//   res.status(200).json({
//     status: 'success',
//     requestTime: req.requestTime,
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });
const getAllTours = factory.getAll(Tour);

const createTour = factory.createOne(Tour);
const updateTour = factory.updateOne(Tour);

const deleteTour = factory.deleteOne(Tour);
const getOneTour = factory.getOne(Tour, { path: 'reviews' });
// const getOneTour = catchAsync(async (req, res,next) => {
//   //populate will fill up the actual data in query not the data base
//   const tour = await Tour.findById(req.params.id).populate("reviews");
//   //Tour.findOne({_id : req.params.id})
//   ///// Đối với nhưng hàm có id thì ta phải kiểm tra cái này
//   if(!tour){
//     const message = "No tour found with that id";
//     return next(new AppError( message,404));
//   }
//   res.status(200).json({
//     status: 'success',

//     data: {
//       tour: tour,
//     },
//   });
// });
const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latiture and longitude in the format lat,lng',
        400
      )
    );
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  console.log(distance, lat, lng, unit);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latiture and longitude in the format lat,lng',
        400
      )
    );

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',

    data: {
      data: distances,
    },
  });
});
// const checkIfBooked = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findOne({ slug: req.params.slug }).populate({
//     path: 'reviews',
//     fields: 'review rating user',
//   });
//   const booking = await Booking.find({ user: req.body.user, tour: tour._id });
//   if(booking){ 
//     req.booking = booking;
//   }
//   next();
// })

module.exports = {
  getAllTours,
  createTour,
  deleteTour,
  updateTour,
  getOneTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  resizeTourImages,
  uploadTourImages
};
