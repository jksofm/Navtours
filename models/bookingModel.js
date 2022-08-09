const mongoose = require('mongoose');
const Tour = require("../models/tourModel")
const bookingSchema = new mongoose.Schema({
    tour : {
        type : mongoose.Schema.ObjectId,
        ref : 'Tour',
        required: [true,"Booking must belong to a Tour"]
    },
    user : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required: [true,"Booking must belong to a User"]
    },
    price : {
        type : Number,
        require : [true,'Booking must have a price']
    },
    createdAt:{
        type : Date,
        default : Date.now()
    },
    paid : {
        type : Boolean,
        default : true
    },
    dateChoose :{
        type : String,
        required : [true,"Booking must choose a data"],
    }
})
bookingSchema.pre(/^find/,function (next) {
  this.populate('user').populate({
    path : 'tour',
    select : 'name'
  })
  next();
})

bookingSchema.pre('save', async function(next) {
    const tour = await Tour.findById(this.tour);
    // const startDate = tour.startDates.id(this.dateChoose);
    dayChooseObj = tour.startDates.filter(date => date._id === this.dateChoose);
     console.log("dayChooseObj: " , dayChooseObj)
    // If there is a maximum number of participants, throw an error.
    if (dayChooseObj.participants >= dayChooseObj.maxParticipants)
      return next(new AppError('Sorry, but this tour has a maximum number of participants already. Please book another date.'));
    tour.startDates.map((date)=>{
      let newparticipants;
       if(date._id === this.dateChoose){

        newparticipants= date.participants + 1;
       }
       return {...date,participants : newparticipants}
    })
   
    
    await tour.save();
    next();
  });


const Booking = mongoose.model("Booking",bookingSchema);
module.exports = Booking;