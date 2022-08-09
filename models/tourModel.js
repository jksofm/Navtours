const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require("./userModel");
// const Review = require("./reviewModel");
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour muse have a name'],
      unique: true,
      maxLength: [40, 'A tour name must have less or equal than 40 characters'],
      minLength: [10, 'A tour name must have more or equal than 10 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['medium', 'easy', 'difficult'],
        message: 'Difficulty is either medium or easy or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above or equal to 1'],
      max: [5, 'Rating must be below or equal to 5'],
      set : val => Math.round(val * 10)/10
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: true,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          //this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount must be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [
      {
        date: {
          type: Date,
          required: [true, 'A tour must have a start date']
        },
        participants: {
          type: Number,
          default: 0
        },
        maxParticipants: {
          type: Number,
          default: 12
        }
      }
    ],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum : ["Point"]
      },
      coordinates : [Number],
      address : String,
      description : String,
    },
    /// VỚi locations thì  sẽ KHÓ THAY đổi và lượng thông tin ít , t cũng không truy cập vào nó thường xuyên nên ta có thể embedd nó vào trong tour
    locations : [
      {
        type : {
          type : String,
          default: "Point",
          enum : ["Point"]
        },

        coordinates : [Number],
        address : String,
        description : String,
        day: Number
        
      }
    ],
    guides :[
      {
        type : mongoose.Schema.ObjectId,
        ref : "User"
      }
    ]


  },
    
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tourSchema.index({price : 1})
tourSchema.index({price : 1,ratingsAverage : -1});
tourSchema.index({slug : 1})
tourSchema.index({startLocation : "2dsphere"})

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
tourSchema.virtual('reviews',{
  ref : "Review",
  foreignField : "tour",
  localField : "_id"
})


///Document middleware  .save() .create()  => execute
tourSchema.pre("save",function(next){
       this.slug = slugify(this.name,{lower : true});
       next();
})
///// Embedding guides users into TOur, thông tin của tourguides có thể thay đổi thương xuyên nên ta không nên embedd nó trong tour mà nên referencing nó 
// tourSchema.pre("save",async function(next){
//  const guidesPromises = this.guides.map(async id=> await User.findById(id));

//  this.guides = await Promise.all(guidesPromises);
//  next();
// })



// tourSchema.post("save",function(doc,next){
//   //// Sau khi đã post xong
//   next();
// })

// ///Query middleware .
// tourSchema.pre(/^find/,function(next){
//   this.find({
//     secretTour : {$ne : true}
//   })
//   console.log(Date.now());

//   next();
// })

// tourSchema.post(/^find/,function(docs,next){
//         // console.log(docs);
//   console.log(Date.now());

//         next();
// })
///// Childref guides
tourSchema.pre(/^find/,function(next){
  this.populate({
    path : "guides",
    select : "-passwordChangedAt -__v"
  });
  next();
})

//Agregation middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } },
//   });
//   next();
// });




const Tour = mongoose.model('Tour', tourSchema);

//   const testTour = new Tour({
//     name: "The Beacg",
//     rating : 4.2,
//     price : 495,
//   })

//   testTour.save().then(doc=>{
//     console.log(doc)
//   }).catch(err=> console.log(err));



module.exports = Tour;
