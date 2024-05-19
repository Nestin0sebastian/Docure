const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const doctorSchema = new Schema({
    DoctorImage: [{
        type: String
    }],
    DoctorName: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    Experience: {
        type: String,
        required: true
    },
    Fee: {
        type: Number,
        required: true
    },
    place: {
        type: String, // Assuming place is a string (e.g., city or hospital name)
        required: true
    },
    Time: {
        type: String, // Assuming time is a string representing time slots
        required: true
    },
    islist: {
        type: Boolean,
        default: false
    }
});

const doctorModel = mongoose.model('doctor', doctorSchema);

module.exports = doctorModel;
