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
        type: String,
        required: true
    },
    Time: {
        type: String,
        required: true
    },
    islist: {
        type: Boolean,
        default: false
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    }
});

const doctorModel = mongoose.model('doctor', doctorSchema);

module.exports = doctorModel;
