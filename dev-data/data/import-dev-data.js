const mongoose = require('mongoose');
const dotenv = require('dotenv');
const db = require('../../config/db');
const fs = require("fs");
const Tour = require('./../../models/tourModel')
const Review = require('./../../models/reviewModel')
const User = require('./../../models/userModel')




dotenv.config()
db.connect();



const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"));



const importData = async()=>{
    try{
     await Tour.create(tours);
     await Review.create(reviews);
     await User.create(users,{validateBeforeSave : false});

     console.log("Data successfully loaded")
     process.exit();
    }
    catch(err){ 
        console.log(err);
    }
}

const deleteData = async()=>{
    try{
       await Tour.deleteMany();
       await Review.deleteMany();
       await User.deleteMany();

       console.log("Deleted data successfully loaded")
     process.exit();

    }catch(err){console.log(err);}
}

if(process.argv[2]==="--import"){
    importData()
}
if(process.argv[2]==="--delete"){
    deleteData();
}
// console.log(process.argv)
// console.log(`${__dirname}/tours-simple.json`)
