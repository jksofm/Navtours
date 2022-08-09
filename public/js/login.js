// const axios = require('axios').default;
import axios from 'axios';
import {showAlert,hideAlert} from './alerts'
///login
export const login = async(email,password)=>{
   
    try{

        const res= await axios({
             method : 'POST',
             url : "/api/v1/users/login",
             data : {email,password}
         })
     
        if(res.data.status ==="success"){
            showAlert('success',"Successfully logged in!");
            window.setTimeout(()=>{
                location.assign('/');
            },1500)
        }
    }catch(e){
       showAlert('error',e.response.data.message);
    }
}
const loginForm = document.querySelector(".form")

if(loginForm){

    document.querySelector(".form").addEventListener("submit", function(e) {
        e.preventDefault();
    
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        login(email,password);
    });
}
////logout
export const logout = async()=>{
    // console.log("hello")
    try{
       const res = await axios({
        method : "GET",
        url :"/api/v1/users/logout"
       });
       if(res.data.status="success"){
        showAlert('success',"Successfully logout!");

          location.assign("/");
       }
    }
    catch(e){
         showAlert("error","Error logging out! Try again later")
    }
}


