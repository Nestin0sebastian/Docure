var express = require('express');
var router = express.Router();
const session = require('express-session');
const multer=require('multer')
const path = require('path');
const userModel = require('../model/schema');
// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // Directory to save uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Save file with a timestamp
    }
});

const upload = multer({ storage: storage });
const categoryModel = require('../model/category');
const doctorModel = require('../model/doctorschema');
const appointmentModel = require('../model/appointment');










const login=(req,res)=>{
    res.render('admin/adminlogin')
  }



const adminloginpost = (req, res) => {
  // Extract email and password from the request body
  const { email, password } = req.body;

  // Check if both email and password are provided
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  // Here, you would typically verify the credentials against your database
  // For now, let's assume you have a hardcoded admin email and password
  const adminEmail = "nestin@gmail.com";
  const adminPassword ="Nestin@123";

  // Check if the provided email and password match the admin credentials
  if (email === adminEmail && password === adminPassword) {
    // If credentials are correct, store the admin email in the session
    req.session.admin = email;
    return res.redirect("/admin");
  } else {
    // If credentials are incorrect, send a 401 Unauthorized response
    return res.status(401).send("Invalid email or password");
  }
};


  const home=(req,res)=>{
    res.render('admin/home')
  }
  

  const catagorylist = async (req, res) => {
    try {
        const data = await categoryModel.find();
        res.render('admin/catagorylist', { data: data });
    } catch (error) {
        console.error("Error fetching categories:", error);
        // Handle the error appropriately, maybe render an error page
        res.status(500).send("Error fetching categories");
    }
};


const editget = async (req, res) => {
  try {
    const id = req.params.id; // Extract the ID from the URL parameters
    console.log("Category ID from params:", id);

    const item = await categoryModel.findOne({ _id: id });
    console.log("Fetched item from database:", item);

    if (item) {
      res.render('admin/editcatagory', { item });
    } else {
      res.redirect('/admin/catagorylist');
    }
  } catch (error) {
    console.log("Error occurred:", error);
    res.redirect('/admin/catagorylist');
  }
};



const editpost = async (req, res) => {
  try {
    const id = req.params.id; // Extract the category ID from the URL parameters

    // Ensure the ID is in ObjectId format
   ;

    // Find the category by ID
    const data = await categoryModel.findOne({ _id: id });

    if (data) {
      // Update the category fields with the values from the request body
      data.name = req.body.name || data.name; 
      data.description = req.body.description || data.description;

      // Save the updated category data
      await data.save();                                        

      // Redirect to the category list page after successful update
      res.redirect('/admin/catagorylist'); 
    } else {
      // If the category with the provided ID is not found, redirect to an error page
      res.redirect('/error'); 
    }
  } catch (error) {
    console.log(error);
    // Handle any errors that occur during the update process
    res.redirect('/error'); // Redirect to an error page
  }
};



const addoctor = async (req, res) => {
  try {
      const catagory = await categoryModel.find();
      console.log(catagory, '///////////////////');
      res.render('admin/addoctor', { catagory });
  } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).send('Internal Server Error');
  }
};


const axios = require('axios');

const addoctorpost = async (req, res) => {
  try {
      console.log(req.file);
      console.log(req.body);

      const { name, doctor_name, clinic_name,experience, fee, place, time_schedule_start, time_schedule_end } = req.body;
      const doctor_image = req.file ? req.file.path.replace(/\\/g, '/').replace('public/', '/') : '';

      // Find the category by name
      const category = await categoryModel.findOne({ name: name });

      if (!category) {
          return res.status(400).send('Category not found');
      }

      // Fetch latitude and longitude for the place using OpenCage API
      const apiKey = 'b95841023bec4424aa162ef49b6b2113';
      const geocodeUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(place)}&key=${apiKey}`;

      const geocodeResponse = await axios.get(geocodeUrl);

      if (!geocodeResponse.data.results.length) {
          return res.status(400).send('Invalid place');
      }

      const { lat, lng } = geocodeResponse.data.results[0].geometry;

      const newDoctor = {
          DoctorName: doctor_name,
          clinic:clinic_name,
          category: category._id,
          Experience: experience,
          Fee: fee,
          place: place,
          Time: `${time_schedule_start} to ${time_schedule_end}`,
          DoctorImage: doctor_image,
          latitude: lat,
          longitude: lng
      };

      console.log(newDoctor);

      const doctorData = await doctorModel.create(newDoctor);

      console.log(doctorData);
      res.status(200).redirect('/admin/'); // Redirect to a success page
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
};



const doctorlist = async (req, res) => {
  try {
    const doctors = await doctorModel.find().populate('category'); // Populate category if it's a reference
    res.render('admin/doctorlist', { doctors }); // Correct the view path
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};



const editdoctor = async (req, res) => {
  try {
      const doctorId = req.params.id;
      console.log(`Fetching doctor with ID: ${doctorId}`);
      const doctor = await doctorModel.findById(doctorId).populate('category');
      if (!doctor) {
          console.log('Doctor not found');
          return res.status(404).send('Doctor not found');
      }
      const categories = await categoryModel.find();
      res.render('admin/editdoctor', { doctor, categories });
  } catch (error) {
      console.error('Error fetching doctor:', error);
      res.status(500).send('Internal Server Error');
  }
};
const editdoctorpost = async (req, res) => {
  try {
    const doctorId = req.params.id;

    // Log request body and file for debugging
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    // Find the doctor by ID
    const doctor = await doctorModel.findById(doctorId);

    if (!doctor) {
      return res.status(404).send('Doctor not found');
    }

    // Update the doctor fields with the values from the request body
    if (req.body.doctor_name) {
      doctor.DoctorName = req.body.doctor_name;
    }if (req.body.clinic) {
      doctor.clinic = req.body.clinic;
    }
    if (req.body.experience) {
      doctor.Experience = req.body.experience;
    }
    if (req.body.fee) {
      doctor.Fee = req.body.fee;
    }
    if (req.body.place) {
      doctor.place = req.body.place;
    }
    if (req.body.time_schedule_start && req.body.time_schedule_end) {
      doctor.Time = `${req.body.time_schedule_start} to ${req.body.time_schedule_end}`;
    }
    if (req.body.category) {
      doctor.category = req.body.category;
    }

    // Update the DoctorImage if a file is uploaded
    if (req.file) {
      const imagePath = '/uploads/' + req.file.filename;
      doctor.DoctorImage = [imagePath];
    }

    // Log updated doctor object for debugging
    console.log('Updated Doctor:', doctor);

    // Save the updated doctor data
    await doctor.save();

    // Redirect to the doctor list page after successful update
    res.redirect('/admin/doctorlist');
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).send('Internal Server Error');
  }
};
const doctorlisted = async (req, res) => {
  try {
    const { id } = req.body;
    const doctor = await doctorModel.findById(id);
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    doctor.islist = !doctor.islist;
    await doctor.save();
    console.log(doctor, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
    
    res.json({ success: true, doctor });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const appointments = async (req, res) => {
  try {
    console.log('Fetching appointments from the database...');
    
    const appointments = await appointmentModel.find().populate('user'); // Populate user for debugging
   
    console.log(appointments, 'Fetched Appointments');
    
    res.render('admin/appointments', { appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error.stack);
    res.status(500).send('Internal Server Error');
  }
};






const users=async(req,res)=>{
  const data=await userModel.find()
  res.render('admin/userlist',{data})
}


const userlist = async (req, res) => {
  const userId = req.params.userId; // Corrected variable name to userId
  try {
      const user = await userModel.findById(userId);
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }
      user.isList = !user.isList;
      await user.save();
      res.status(200).json({ message: 'User list status toggled successfully', user: user });
  } catch (error) {
      console.error('Error toggling user list status:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
}



const logout = (req, res) => {
  // Check if the session exists
  if (req.session && req.session.admin) {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        res.status(500).send('An error occurred while logging out.');
      } else {
        // Redirect to the admin login page
        res.redirect('/admin/login');
      }
    });
  } else {
    // If there is no session, redirect to the admin login page
    res.redirect('/admin/login');
  }
};

  module.exports={
    login,
    adminloginpost, 
    home,
    catagorylist,
    editget,
    editpost,
    addoctor,
    addoctorpost,
    doctorlist,
    editdoctor,
    editdoctorpost,
    doctorlisted,
    appointments,
    users,
    userlist,
    logout
    
  }