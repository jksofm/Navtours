const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");




exports.deleteOne = Model => catchAsync(async (req, res,next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if(!doc){
      ///Tự custom Error và loai bỏ catch
      return next(new AppError("No document found with that id",404));
    }
    //Tour.findOne({_id : req.params.id})
    res.status(200).json({
      status: 'success',
    });
  });

  exports.updateOne = Model => catchAsync(async (req, res,next) => {
   
  
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if(!document){
      return next(new AppError("No document found with that id",404));
    }
  
    res.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

  exports.createOne = Model =>  catchAsync(async (req, res,next) => {
    const doc = await Model.create(req.body);
  
    res.status(201).json({
      status: 'success',
      data: {
        data : doc
      },
    });
  });

  exports.getOne = (Model,popOptions) =>catchAsync(async (req, res,next) => {
    let query = Model.findById(req.params.id)
    //populate will fill up the actual data in query not the data base
    if(popOptions){
         query =  query.populate(popOptions);
    }
    const doc = await query;
    //Tour.findOne({_id : req.params.id})
    ///// Đối với nhưng hàm có id thì ta phải kiểm tra cái này
    if(!doc){
      const message = "No document found with that id";
      return next(new AppError( message,404));
    }
    res.status(200).json({
      status: 'success',
  
      data: {
        data : doc
      },
    });
  });

  exports.getAll = Model => catchAsync(async (req, res,next) => {

   ///To allow for nested get review on tour
    let filter = {};
    if(req.params.tourId){
       filter = {tour : req.params.tourId};
    }
    ////Execute
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const doc = await features.query;
  
    res.status(200).json({
      status: 'success',
      requestTime: req.requestTime,
      results: doc.length,
      data: {
        doc,
      },
    });
  });






