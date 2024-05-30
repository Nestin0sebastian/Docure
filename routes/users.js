var express = require('express');
var router = express.Router();
const user = require('../controllers/userController')
const {checksession,loginback}=require('../middlewares/isAuthenticate')
const {isblocked}=require('../middlewares/checkIsblocked')

function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}



router.get('/login',nocache,loginback,user.login)
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
router.get('/',nocache,checksession,isblocked,user.home)
router.post('/loginpost',user.loginpost)
router.get('/catagorydisplay',user.catagory)
router.get('/doctorslist/:category',user.doctorslist)
router.get('/findDoctorsNearPlace', user.findDoctorsNearPlace);
router.get('/appointmentget',isblocked,user.appointmentget)
router.post('/proceedToPay',user.proceedToPay)
router.post('/verifypayment',user.verifypayment)
router.get('/paymentsuccess',user.paymentsuccess)
router.get('/invoice/:appointmentId',user.invoice)
router.get('/recentlyConsulted',user.recentlyConsulted)
router.delete('/cancelappointment/:appointmentId',user.cancelAppointment)
router.get('/wallet',user.wallet)
router.post('/walletpost',user.walletpost)
router.get('/chatbot',user.chatbot)
router.get('/logout',user.logout)










module.exports =router