const mongoose = require('mongoose');
const Tour = require('./tourModel');
// const User = require('./userModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref :  "Tour",/// Phải trùng với tên của model
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.index({tour : 1 , user : 1},{unique : true})

reviewSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'tour',
//     select: 'name',
 
//   }).populate({
//     path: 'user',
//     select: 'name photo',
   
//   });
  this.populate({
    path: 'user',
    select: 'name photo',
   
  });

  next();
});

////Cập nhật rating khi thêm review
///Static method// Sử dụng static bởi vì nó call aggregate
reviewSchema.statics.calcAverageRating = async function(tourId){
   const stats = await this.aggregate([
      {
        $match : {tour: tourId}
      },
      {
        $group : {
          _id : '$tour',
          nRating : {$sum : 1},
          avgRating : {$avg : '$rating'}
        }
      }
     ])
    //  console.log(stats);
     if(stats.length >0){

       const newTour = await Tour.findByIdAndUpdate(tourId,{
          ratingsQuantity : stats[0].nRating,
          ratingsAverage: stats[0].avgRating
    
         })
     }else{
      const newTour = await Tour.findByIdAndUpdate(tourId,{
        ratingsQuantity : 0,
        ratingsAverage: 4.5
       })
     }
}
reviewSchema.post("save",function(){
  //this points to current review
 
  this.constructor.calcAverageRating(this.tour);
  
  
})

//////Cập nhật rating khi update và xóa review
//// Ta cũng không thể sử dụng function calcAverageRating vì nó sẽ lấy dữ liệu cũ . Trong create ta có thể sử  dụng bởi vì middlware sử dụng là post . nhưng với trường hợp này thì khi sử dụng post ta sẽ không thế query và lấy ra id  được bởi vì nó đã đươc executed. 

reviewSchema.post(/^findOneAnd/,async function(doc){
  //We can not query in post when query was excuted
 
 
  if(doc){

    await Review.calcAverageRating(doc.tour);
  }
})



const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
