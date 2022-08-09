const mongoose = require('mongoose');
const dotenv = require('dotenv');



dotenv.config();
 
// const uri= `${process.env.DATABASE}`

async function connect() {
    try {
      await mongoose.connect((process.env.DATABASE), {
        useNewUrlParser: true,
        // useCreateIndex: true,
        useUnifiedTopology: true,
        
      })
      console.log('Connect successfully!!!');
    } catch (error) {
      console.log('Connect failure!!!',error);
    }
  }
  module.exports = {connect};