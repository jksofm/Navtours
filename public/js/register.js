import axios from 'axios';
import {showAlert,hideAlert} from './alerts'


export const register = async(email,name,password,passwordConfirm) =>{

  try {
    const res= await axios({
        method : 'POST',
        url : "/api/v1/users/signup",
        data : {name,email,password,passwordConfirm}
    })

   if(res.data.status ==="success"){
       showAlert('success',"Successfully register!");
       window.setTimeout(()=>{
           location.assign('/');
       },1500)
   }

  }catch(e){
    showAlert('error',e.response.data.message);

  }
   

}





