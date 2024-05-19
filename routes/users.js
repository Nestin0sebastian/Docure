var express = require('express');
var router = express.Router();
const user = require('../controllers/userController')

router.get('/login',user.login)
router.get('/signup',user.signup)
router.post('/signupPost', user.signupPost);
router.get('/otp',user.OTP)
router.post('/resendOtp',user.resendOtp)
router.post('/postotp',user.postotp)
router.get('/otpsuccess',user.otpsuccess)
router.get('/forgotpassword',user.forgotpassword)
router.post('/emailpost',user.emailpost)
router.get('/emailsuccess',user.emailsuccess)
router.get('/passwordreset',user.resetPassword)
router.post('/resetsuccess',user.resetsuccess)
router.get('/',user.home)
router.post('/loginpost',user.loginpost)
router.get('/catagorydisplay',user.catagory)










module.exports =router