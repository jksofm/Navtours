/* eslint-disable prettier/prettier */
/* eslint-disable import/newline-after-import */
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const db = require("./config/db");
const app = require('./app');
const mongoose = require('mongoose');


db.connect();




// console.log(process.env);







const port = process.env.PORT || 3000;
 const server =app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

process.on("unhandledRejection", (err) => {
     console.log(err.name,err.message);
     console.log("UNHANDLED REJECTION");
     server.close(()=>{
       
       process.exit(1);
     })
})
process.on("uncaughtException", (err) => {
  console.log(err.name,err.message);
  console.log("UNHANDLED REJECTION");

    
    process.exit(1);
  
})

process.on("SIGTERM",()=>{
  console.log("SIGTEM RECEIVED! Shut down gracefully");
  server.close(()=>{
    console.log("Process terminated!")
  })
})


//test
//test