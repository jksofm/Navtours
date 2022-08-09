import axios from 'axios';
import {showAlert} from "./alerts";
const AppError = require('../../utils/appError');

export const commentTour = async (rating,review,tourId) =>{
    try{
        const reviewComment = await axios.post(`http://localhost:3000/api/v1/tours/${tourId}/reviews`,{
            rating ,
            review
        });
        showAlert("success","You have successfully reviewed the tour");
        location.reload(true);

       
    }catch(e){
      console.log(e);
      showAlert("error","You have to book the tour before continuing.");
    }
}
export const deleteComment = async(reviewId)=>{
    try{
        const reviewComment = await axios.delete(`http://localhost:3000/api/v1/reviews/${reviewId}`);
        showAlert("success","Successfully!");
        location.reload(true);

       
    }catch(e){
      console.log(e);
      showAlert("error","Somthing went wrong, please try again");
    }
}
