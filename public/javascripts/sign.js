var emailEror = document.getElementById('email-error');
var passwordEror = document.getElementById('password-error');
var submitErorr = document.getElementById('submit-error');

function validatEmail(){
var email = document.getElementById('contact-email').value;
 
if(email.lehgth === 0){
   emailEror.innerHTML=' Required';
   return false;
}
if(!email.match(/^[A-Za-z0-9._-]+@[A-Za-z]+\.[a-z]{2,4}$/)){
   emailEror.innerHTML = ' invalid';
   return false;
}
emailEror.innerHTML= ' Valid'
return true;

}

function validatpass(){
   var pass= document.getElementById('password').value;
    
   if(pass.length === 0){
       passwordEror.innerHTML=' Required'
      return false;
   }
   if(!pass.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\-+.]).{6,20}$/)){
       passwordEror.innerHTML = ' invalid'
      return false;
   }
   passwordEror.innerHTML= ' Valid'
   return true;
  
  }

  function validForm() {
   if (!validatEmail() || !validatpass()) {
     submitErorr.style.display = 'block';
     submitErorr.innerHTML = 'please enter correct detials';
     setTimeout(function () {
       submitErorr.style.display = 'none';
     }, 3000);
     return false;
   }
 
    // Display an alert to the user

   
   return true;
 }

 const ERROETAG =   document.getElementById('errorMessage')
   setTimeout(()=>{
      ERROETAG.style.display = 'none'
   },5000)



