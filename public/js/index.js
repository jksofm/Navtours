import '@babel/polyfill';
import {login,logout} from "./login"
import {register} from "./register"
import {updateSettings} from "./updateSettings"
import {bookTour} from "./stripe"
import {commentTour,deleteComment} from "./comment"



////login
const loginForm = document.querySelector(".form")
if(loginForm){

    document.querySelector(".form").addEventListener("submit", function(e) {
        e.preventDefault();
    
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        login(email,password);
    });

}
///logout
const logoutBtn = document.querySelector(".logoutButton");
if(logoutBtn){
    logoutBtn.addEventListener("click",function(e){
        // console.log("logout")
       e.preventDefault();
        logout();
    })
}
///register
const registerForm = document.querySelector(".registerForm")
if(registerForm){
    document.querySelector(".registerForm").addEventListener("submit",function(e){
        e.preventDefault();
        // console.log("hellolooo");
        const email = document.getElementById("emailRegister").value;
        const password = document.getElementById("passwordRegister").value;
        const name = document.getElementById("registerName").value;
        const passwordConfirm = document.getElementById("confirmPassword").value;
        // console.log(email,password,name,passwordConfirm);
        register(email,name,password,passwordConfirm);
    })
}
///Update my data
const updateForm = document.querySelector(".updateForm")
const updatePasswordForm = document.querySelector(".updatePassword")

if(updateForm){

    document.querySelector(".updateForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const form = new FormData();
        form.append("name",document.getElementById("nameUpdate").value)
        form.append("email",document.getElementById("emailUpdate").value)
        form.append("photo",document.getElementById("photoUpdate").files[0])
    //    console.log("hello",form);
        // const email = document.getElementById("emailUpdate").value;
        // const name = document.getElementById("nameUpdate").value;
        updateSettings(form,"data");
    });
}
if(updatePasswordForm){
     updatePasswordForm.addEventListener("submit", function(e) {
        
        const currentPassword = document.getElementById("password-current").value;
        const newPassword = document.getElementById("password-new").value;
        const confirmPassword = document.getElementById("password-confirm").value;
         if(newPassword === confirmPassword) {
        updateSettings({newPassword,currentPassword},"password");

         }else {
            showAlert('success',"Password is not the same!");
         }
     })
}
///Booking
const bookBtn = document.getElementById('book-tour');
const selectStartDate = document.getElementById('selectDate');
if(bookBtn && selectStartDate){
    bookBtn.addEventListener('click',e=>{
        e.target.textContent = "Processing...";
        const tourID = e.target.dataset.tourid;
        const startDateId = selectStartDate.value;
        // console.log(e.target.dataset);
        bookTour(tourID,startDateId);
    })
}
///comment 
const commentForm = document.getElementById('commentForm');
if(commentForm){
    const commentBtn = document.getElementById('btn-comment');

    commentForm.addEventListener("submit",e=>{
        e.preventDefault();
        const review = document.getElementById('commentInput').value;
        const rating = document.getElementById('ratingInput').value;
        const tourID = commentBtn.dataset.tourid;
        // console.log(tourID);
        commentTour(rating,review,tourID);
    })
}
//delete comment
const btnDeleteComment = document.getElementById('deleteComment');
if(btnDeleteComment){
    btnDeleteComment.addEventListener("click",e=>{
        const reviewId = e.target.dataset.reviewid;

        deleteComment(reviewId);
    })
}




