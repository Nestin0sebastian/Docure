var express = require('express');
var router = express.Router();
const admin = require('../controllers/adminController')
const category = require('../controllers/catagoryController')
const path = require('path');

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


router.get('/login',admin.login)

router.post('/loginpost',admin.adminloginpost)

router.get('/',admin.home)

router.get('/addcategory',category.addcategory)

router.post('/addcatagorypost',category.addcategorypost)

router.get('/catagorylist',admin.catagorylist)


router.get('/editcatagory/:id', admin.editget);

router.post('/catagorypost/:id',admin.editpost)

router.post('/blockcatagory/:userId',category.listed)

router.get('/addoctor',admin.addoctor)

router.post('/addoctorpost', upload.single('doctor_image'),admin. addoctorpost);

router.get('/doctorlist',admin.doctorlist)

router.get('/editdoctor/:id',admin.editdoctor)

router.post('/editdoctorpost/:id',upload.single('doctor_image'),admin.editdoctorpost)

router.post('/doctorlisted',admin.doctorlisted)


module.exports =router

