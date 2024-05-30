
const session = require('express-session')
const bcrypt = require('bcrypt');
require('dotenv').config();
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const { token } = require('morgan');
const userModel = require('../model/schema');
const categoryModel = require('../model/category');
const doctorModel = require('../model/doctorschema');
const appointmentModel = require('../model/appointment');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');

const Razorpay = require('razorpay');
const razorpay = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.Secret_key
});

const geocoder = require('node-geocoder'); // Assuming 'geocoder' is the correct module name
const fetch = require('node-fetch');

const { v4: uuidv4 } = require('uuid');






const login = (req, res) => {
    res.render('login'); 
}


const signup=(req,res)=>{
    res.render('sign')
}

const signupPost = (req, res) => {
    const { firstname, lastname, email, password, conformPassword } = req.body;

    if (password !== conformPassword) {
        return res.status(400).send('Passwords do not match');
    }

    // Generate OTP
    const otp = generateOtp(); // Implement your OTP generation function

    // Set OTP and expiration time in session
    req.session.otp = {
        code: otp,
        generatedAt: Date.now(), // Store the timestamp when the OTP was generated
        expirationTime: new Date(Date.now() + 5 * 60 * 1000).getTime() // Set expiration time to 5 minutes in the future
    };

    // Save user data in session
    req.session.user = {
        firstname,
        lastname,
        email,
        password
    };

    console.log(req.session.user);
    console.log(req.session.otp);

    // Send OTP to user (e.g., via email or SMS)
    sendOtp(email, otp);

    res.redirect('/otp'); // Redirect to OTP verification page
};

function generateOtp() {
    return randomstring.generate({
        length: 6,
        charset: 'numeric',
    });
}

function sendOtp(email, otp) {
    console.log(email, otp);
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: 'Your OTP for registering at LapBook',
        text: `Your OTP for verification is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email: ' + error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}




const OTP=(req,res)=>{
    res.render('otp')
}
const resendOtp = async (req, res) => {
    try {
        const email = req.session.user.email; // Assuming user email is stored in session under req.session.user.email

        // Generate new OTP
        const newOtp = generateOtp();

        // Update session with new OTP
        delete req.session.otp;
        req.session.otp = {
            code: newOtp,
            generatedAt: Date.now(),
            expirationTime: new Date(Date.now() + 30 * 1000).getTime(), // Set expiration time (30 seconds in this example)
        };

        // Send new OTP to user
        sendOtp(email, newOtp);

        res.status(200).json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const postotp = async (req, res) => {
    try {
        // Log the current OTP stored in the session
        console.log("Session OTP:", req.session.otp);

        // Retrieve the entered OTP from the request body
        const enteredOtp = req.body.otp;

        // Check if the entered OTP matches the one stored in the session and if it's not expired
        if (req.session.otp.code === enteredOtp && req.session.otp.expirationTime > Date.now()) {
            // Hash the password
            const hashedPassword = await bcrypt.hash(req.session.user.password, 10);

            // Create a new user with hashed password and other data from the session
            const newUser = await userModel.create({
                firstname: req.session.user.firstname,
                lastname: req.session.user.lastname,
                email: req.session.user.email,
                phone:req.body.phonenumber,
                password: hashedPassword, // Store the hashed password
                // You may need to adjust this part depending on your schema
            });

            // Redirect the user to the login page after successful creation
            console.log("New user created:", newUser); // Log the new user data if needed
            return res.status(200).redirect('/otpsuccess');
        } else {
            // Invalid OTP or OTP expired
            req.session.otperr = "Invalid OTP or time expired";
            return res.redirect('/otp');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
};


// Function to generate a random referral ID
function generateRandomId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomId = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomId += characters.charAt(randomIndex);
    }

    return randomId;
}


const otpsuccess=(req,res)=>{
    res.render('otpsuccess')
}


const forgotpassword=(req,res)=>{
    res.render('forgotpasswordemail')
}



function sendresetlink (email,token){
    const transporter=nodemailer.createTransport({
       service:'gmail',
       auth:{
           user: process.env.EMAIL_ADDRESS,
           pass: process.env.EMAIL_PASSWORD,
   
       },
   })
   
           
   
       const resetpasswordLink = `http://localhost:3003/passwordreset?token=${token}`;
         
   
       const  mailOptions = {
           from: process.env.EMAIL_ADDRESS,
           to: email,
           subject: 'Reset Your Password',
           text: `<p> Use the following link to reset your password: <a href="${resetpasswordLink}">${resetpasswordLink}</a></p>`,
       };
   
       transporter.sendMail(mailOptions, (error, info) => {
           if (error) {
               console.error('Error sending email: ' + error);
           } else {
               console.log('Email sent: ' + info.response);
           }
       });
   }
   const generateResetPasswordToken = () => {
    // Generate a random token using uuid
    return uuidv4();
};

   const emailpost = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });

        if (user && user.email === email) {
            const token = generateResetPasswordToken(); // Custom function to generate a reset password token
            req.session.token=token
            user.resetpasswordToken = token;
            user.resetTokenExpire = new Date(Date.now() + 10 * 60 * 1000); // Token valid for 10 minutes

            await user.save();

            sendresetlink(email, token);
        res.redirect('/emailsuccess')
        
        } else {
            res.status(404).send('Email not found');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};





const emailsuccess=(req,res)=>{
    res.render('emailsuccess')
}

const resetPassword = async (req, res) => {
    try {
        const token = req.session.token;
        const user = await userModel.findOne({ resetpasswordToken: token });

        if (user) {
            // Render the forgot password page with the token
            res.render('passwordreset', { token });
        } else {
            // If user not found, handle the error or redirect to an error page
            res.status(404).send('User not found');
        }
    } catch (error) {
        // Handle any errors that occur during the process
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const changePasswordPost = async (req, res) => {
    // Extract necessary data from the request
    const userId = req.session.user._id;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;

    try {
        // Find the user by ID
        const userData = await userModel.findById(userId);

        // Validate the current password using bcrypt.compare
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData.password);

        if (!isCurrentPasswordValid) {
            // Return a 400 error if the current password is invalid
            return res.status(400).json({ message: 'Invalid current password' });
        }

        // Validate the new password and confirm password
        if (newPassword !== confirmPassword) {
            // Return a 400 error if the new password and confirm password do not match
            return res.status(400).json({ message: 'New password and confirm password do not match' });
        }

        // Hash the new password before saving it to the database
        const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the number of salt rounds

        // Update the user's password with the hashed password
        userData.password = hashedPassword;
        await userData.save();

        // Redirect the user to the profile page after successful password change
        res.redirect('/resetsuccess');
    } catch (error) {
        // Handle any errors that occur during the process
        console.error('Error:', error);

        // Return a 500 error and display an error message
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const resetsuccess=(req,res)=>{
    res.render('resetsuccess')
}

const home = async (req, res) => {
    try {
        const user = req.session.dataofuser.firstname;

        // Fetch appointments for the user
        const appointments = await appointmentModel.find({ user: req.session.dataofuser._id });
        const doctors = await doctorModel.find().limit(4).populate('category');

        res.render('home', { user, appointments,doctors });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).send('Error fetching appointments. Please try again later.');
    }
};



const loginpost = async (req, res) => {
    try {
        const loguser = await userModel.findOne({ email: req.body.email });
        
        if (!loguser) {
            return res.redirect('/login?errorMessage=Invalid%20email%20or%20password');
        }

        const passwordMatch = await bcrypt.compare(req.body.password, loguser.password);
        
        if (passwordMatch) {
            req.session.dataofuser = loguser;

            return res.redirect('/');
        } else {
            return res.redirect('/login?errorMessage=Invalid%20email%20or%20password');
        }
    } catch (error) {
        console.log(error);
        req.session.error = "An error occurred. Please try again later.";
        return res.redirect('/login?errorMessage=An%20error%20occurred');
    }
};




const catagory = async (req, res) => {
    try {
        const data = await categoryModel.find();
        console.log(data,'//////////////////')
        res.render('catagory', { data: data }); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};


const doctorslist = async (req, res) => {
    const categoryName = req.params.category;
    console.log(categoryName, '}{}{}{}{}}{{{{{{{{{{{{{{{');

    try {
        // Find the category document by name
        const category = await categoryModel.findOne({ name: categoryName });

        if (!category) {
            return res.status(404).send('Category not found');
        }

        // Find doctors by the category's ObjectId
        const doctors = await doctorModel.find({ category: category._id }).populate('category');

        console.log(doctors, 'lllllllllllllllllllllllllll');
        res.render('doctorlist', { doctors });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const findDoctorsNearPlace = async (req, res) => {
    try {
        const { place, category } = req.query;
        console.log('Received place:', place);
        console.log('Received category:', category);

        if (!place) {
            return res.status(400).json({ error: 'Please provide a place name' });
        }

        if (!category) {
            return res.status(400).json({ error: 'Please provide a category' });
        }

        const foundCategory = await categoryModel.findOne({ name: category });
        if (!foundCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const doctors = await doctorModel.find({ category: foundCategory._id }).populate('category');
        console.log('Found doctors:', doctors);

        const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}`;
        const response = await fetch(geocodingUrl);
        const geocodingData = await response.json();
        if (!geocodingData.results || geocodingData.results.length === 0) {
            return res.status(400).json({ error: 'Failed to find location coordinates for the provided place' });
        }

        const location = geocodingData.results[0];
        const latitude = location.latitude;
        const longitude = location.longitude;

        doctors.forEach(doctor => {
            const doctorLatitude = doctor.latitude;
            const doctorLongitude = doctor.longitude;
            doctor.distance = calculateDistance(latitude, longitude, doctorLatitude, doctorLongitude);
        });

        doctors.sort((a, b) => a.distance - b.distance);

        console.log('Sorted doctors by distance:', doctors);

        res.render('doctorlist', { doctors });

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}



const appointmentget = (req, res) => {
    const { doctor, category, name, fee } = req.query;

    req.session.doctorname = doctor;
    req.session.fee = fee;
    req.session.category = category;

    console.log('Doctor:', doctor, 'Category:', category, 'Name:', name, 'Fee:', fee);

    res.render('appointment', { category, name, fee });
}



const proceedToPay = async (req, res) => {
    // Store appointment details in session
    req.session.appointmentDetails = {
        fullName: req.body.fullName,
        mobileNumber: req.body.mobileNumber,
        email: req.body.email,
        appointmentDate: req.body.appointmentDate,
        timeSlot: req.body.timeSlot,
        fee: req.body.fee
    };

    // Log appointment details

    
    try {
        // Create appointment document
        const newAppointment = new appointmentModel({
            patientName: req.body.fullName,
            patientMobile: req.body.mobileNumber,
            patientEmail: req.body.email,
            appointmentDate: req.body.appointmentDate,
            appointmentTime: req.body.timeSlot,
            doctor:req.session.doctorname,
            category:req.session.category,
            fee:req.session.fee,
            user:req.session.dataofuser._id
           // Ensure req.session.name._id contains a valid doctor ID
        });

        // Save appointment to database
        await newAppointment.save();

        // Proceed with payment processing
        const payment_capture = 1;
        const amount = req.session.appointmentDetails.fee * 100; // amount in the smallest currency unit (paise)
        const currency = 'INR';

        const options = {
            amount,
            currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture
        };

        // Create Razorpay order
        const order = await razorpay.orders.create(options);
        req.session.order_id = order.id;

        // Respond with order details
        res.json({ order_id: order.id, amount: amount, currency: currency, key: process.env.KEY_ID });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).send('Error creating appointment and order');
    }
};



const verifypayment = (req, res) => {
    const { order_id, payment_id, signature } = req.body;

    const body = order_id + "|" + payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.SECRET_KEY)
                                    .update(body.toString())
                                    .digest('hex');

    if (expectedSignature === signature) {
        // Payment successful
        res.status(200).json({ status: 'success' }); // Respond with success status
    } else {
        res.status(400).json({ status: 'failure' });
    }
}

const paymentsuccess=(req,res)=>{
    res.render('paymentsuccess')
}




const invoice = async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;

        // Fetch the appointment data
        const appointment = await appointmentModel.findById(appointmentId).populate('user');
        if (!appointment) {
            return res.status(404).send('Appointment not found');
        }

        const user = appointment.user;
        if (!user) {
            return res.status(400).send('User not found');
        }

        // Constructing invoiceDetail object with available user information
        const invoiceDetail = {
            shipping: {
                name: `${user.firstname} ${user.lastname}`,
                email: user.email,
                
            },
            items: [{
                item: 'Consultation',
                description: `Consultation with Dr. ${appointment.doctor}`,
                quantity: 1,
                price: appointment.fee,
            }],
            subtotal: appointment.fee,
            total: Number(appointment.fee), // Assuming 50 is the shipping fee
            order_number: appointmentId,
            header: {
                company_name: "Dolt",
                company_address: "Dolt Consultation, 12 Keizersgracht Street, Netherlands, +1 234-567-890"
            },
            footer: {
                text: "Thank you for connecting!",
            },
            currency_symbol: "₹",
            date: {
                billing_date: new Date().toLocaleDateString(),
                due_date: new Date().toLocaleDateString(),
            },
        };

        // Generating the PDF
        const doc = new PDFDocument({ margin: 50 });

        // Header
        doc.fontSize(24).text('Receipt', { align: 'center', underline: true }).moveDown(1);

        // Customer Details Section
        doc.fontSize(12).text('Customer Details:', { underline: true }).moveDown(0.5);
        doc.fontSize(10).text(`Name: ${invoiceDetail.shipping.name}`, { indent: 20 });
        doc.fontSize(10).text(`Email: ${invoiceDetail.shipping.email}`, { indent: 20 });
        doc.moveDown(1);

        // Items Section
        doc.fontSize(12).text('Appointment details:', { underline: true }).moveDown(0.5);
        invoiceDetail.items.forEach(item => {
            doc.fontSize(10).text(`Description: ${item.description}`, { indent: 20 });
            doc.fontSize(10).text(`Speciality: ${appointment.category}`, { indent: 20 });
            doc.fontSize(10).text(`Fee: ${invoiceDetail.currency_symbol}${item.price}/-`, { indent: 20 });
            doc.fontSize(10).text(`Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}`, { indent: 20 });
            doc.fontSize(10).text(`Time: ${appointment.appointmentTime}`, { indent: 20 });
            doc.moveDown(0.5);
        });

        // Payment Status Section
        doc.fontSize(12).text('Payment Status', { underline: true }).moveDown(0.5);
        doc.fontSize(10).text(`Amount paid: ${invoiceDetail.currency_symbol}${invoiceDetail.total}/- (PAID)`, { align: 'left' });

        // Company Information Section
        doc.fontSize(10).text(invoiceDetail.header.company_name, { align: 'center', margin: [0, 40, 0, 0] });
        doc.fontSize(8).text(invoiceDetail.header.company_address, { align: 'center' }).moveDown(1);

        // Footer
        doc.fontSize(10).text(invoiceDetail.footer.text, { align: 'center', margin: [0, 60, 0, 0] });

        // End the document
        doc.end();

        // Set response headers
        res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while generating the invoice');
    }
};

const recentlyConsulted = async (req, res) => {
    try {
        const currentDate = new Date(); // Get the current date
        
        // Find appointments where the appointment date is greater than or equal to the current date
        const appointments = await appointmentModel.find({ 
            user: req.session.dataofuser._id,
            appointmentDate: { $lte: currentDate.toISOString() } // Convert current date to ISO string format
        });

        res.render('recentlycounsulted', { appointments });
        console.log(appointments, 'llllllllllllllllllllllllllloooo');
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).send('Error fetching appointments. Please try again later.');
    }
};
const cancelAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;
        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Find the user associated with the session
        const user = await userModel.findById(req.session.dataofuser._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Refund the appointment fee to the user's wallet
        user.wallet += appointment.fee; // Increment wallet by appointment fee
        await user.save();

        // Delete the appointment
        await appointment.deleteOne();

        res.status(200).json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ message: 'An error occurred while cancelling the appointment' });
    }
};




const wallet = async (req, res) => {
    try {
        const user = req.session.dataofuser._id;

        // Fetch user data from the database
        const data = await userModel.findById(user);
        if (!data) {
            return res.status(404).send('User not found');
        }

        const amount = data.wallet;
        const name = req.session.dataofuser.firstname;

        // Render the wallet page with the user's amount and name
        res.render('wallet', { amount, name });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('An error occurred while fetching user data');
    }
};




const walletpost = async (req, res) => {
    try {
        // Retrieve data from request body
        const { amount, accountNumber } = req.body;

        // Retrieve user's wallet details
        const userId = req.session.dataofuser._id;
        const user = await userModel.findById(userId);

        // Update wallet balance
        user.wallet -= amount;
        await user.save();

        // Do whatever you need to with the data
        console.log('Amount:', amount);
        console.log('Account Number:', accountNumber);

        // Respond to the request
        res.status(200).json({ message: 'Data received successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'An error occurred' });
    }
};


const chatbot=(req,res)=>{
    res.render('Aichatbot')
}

const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
}


module.exports={
    login,
    signup,
    signupPost,
    OTP,
    resendOtp,
    postotp,
    otpsuccess,
    forgotpassword,
    emailpost,
    emailsuccess,
    resetPassword,
    changePasswordPost,
    resetsuccess,
    home,
    loginpost,
    catagory,
    doctorslist,
    findDoctorsNearPlace,
    appointmentget,
    proceedToPay,
    verifypayment,
    paymentsuccess,
    invoice,
    recentlyConsulted,
    cancelAppointment,
    wallet,
    walletpost,
    chatbot,
    logout
    
}
