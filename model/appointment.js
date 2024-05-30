const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({

    patientName: {
        type: String,
        required: true
    },
    patientMobile: {
        type: String,
        required: true
    },
    patientEmail: {
        type: String,
        required: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    appointmentTime: {
        type: String, // You can adjust this data type based on how you handle time in your application
        required: true
    },
    doctor: {

        type: String,
        required: true

    },  
      category: {

        type: String,
        required: true

    },
    fee: {

        type: String,
        required: true

    }
    

    , 
     user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userdb',
        required: true
    },
 
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
