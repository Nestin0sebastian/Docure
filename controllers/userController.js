
const session = require('express-session')
const bcrypt = require('bcrypt');
require('dotenv').config();
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const { token } = require('morgan');
const userModel = require('../model/schema');
const { v4: uuidv4 } = require('uuid');






const login = (req, res) => {
    res.render('login'); // Assuming 'login' is the directory and 'log' is the EJS file inside it
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

const home=(req,res)=>{
    res.render('home')
}


const loginpost = async (req, res) => {
    try {
        const loguser = await userModel.findOne({ email: req.body.email });

        // if (loguser) {
        //     if (loguser.isblocked) {
        //         return res.redirect("/login?errorMessage=User%20is%20blocked");
        //     }
            const passwordMatch = await bcrypt.compare(req.body.password, loguser.password);
            if (passwordMatch) {
                req.session.dataofuser = loguser;
                return res.redirect('/');
            } else {
                return res.redirect('/login?errorMessage=Invalid%20email%20or%20password');
            }
        // } else {
        //     return res.redirect('/login?errorMessage=Invalid%20email%20or%20password');
        // }
    } catch (error) {
        console.log(error);
        req.session.error = error;
        return res.redirect('/login?errorMessage=An%20error%20occurred');
    }
};


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
    loginpost
}
