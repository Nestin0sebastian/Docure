var express = require('express');
var router = express.Router();
const admin = require('../controllers/adminController')
const category = require('../controllers/catagoryController')
const path = require('path');
const {adminchecksession,adminloginback}=require('../middlewares/adminauthenticate')

const multer=require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads'); // Directory to save uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Save file with a timestamp
    }
});

const upload = multer({ storage: storage });


router.get('/login',adminloginback,admin.login)

router.post('/loginpost',admin.adminloginpost)

router.get('/',adminchecksession,admin.home)

router.get('/addcategory',adminchecksession,category.addcategory)

router.post('/addcatagorypost',category.addcategorypost)

router.get('/catagorylist',adminchecksession,admin.catagorylist)


router.get('/editcatagory/:id',adminchecksession, admin.editget);

router.post('/catagorypost/:id',admin.editpost)

router.post('/blockcatagory/:userId',category.listed)

router.get('/addoctor',admin.addoctor)

router.post('/addoctorpost', upload.single('doctor_image'),admin. addoctorpost);

router.get('/doctorlist',admin.doctorlist)

router.get('/editdoctor/:id',admin.editdoctor)

router.post('/editdoctorpost/:id',upload.single('doctor_image'),admin.editdoctorpost)

router.post('/doctorlisted',admin.doctorlisted)


router.get('/appointmentget',admin.appointments)

router.get('/userlist',admin.users)

router.post('/userlist/:userId',admin.userlist)

router.get('/logout',admin.logout)

module.exports =router

