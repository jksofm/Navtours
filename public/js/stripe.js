import axios from 'axios';
import {showAlert} from "./alerts";
 const stripe = Stripe(`pk_test_51LUMhgIwef8WHhdpKXyq2M26fO6dgmtcHxu8c8c43Q6O4bGIItIXb6Plo5qx3gweesx76CAR4gg1souNch9xDGD000IbPtd9GQ`);
 const AppError = require('../../utils/appError');
 

export const bookTour = async (tourId,startDateId) =>{
    try{
        console.log("hello")
        //1Create tour
        const product = await axios.post(`/api/v1/bookings/create-product/${tourId}`);
        // console.log(product);
            if(!product) return new AppError("Couldn't create product!Please try again")
              
        
        //Create price
        const price = await axios.post(`/api/v1/bookings/create-price/${tourId}/${product.data.product.id}`);
        if(!price) return new AppError("Couldn't create price!Please try again")
        // console.log(price);
    
    
    
        //Creat checkout session
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}/${price.data.price.id}/${startDateId}`);
    
        //  console.log("session: ",session);
        // /Create checkout form + charge creadit card
           await stripe.redirectToCheckout({
            sessionId: session.data.session.id
           })
    }catch(e){
      console.log(e);
      showAlert("danger","Something went wrong!Please try again");
    }
   


}