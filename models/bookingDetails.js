const mongoose = require('mongoose');
let bookingSchema = new mongoose.Schema({
    userID: {
        type: String,
        default: ''
    },
    start: {
        type: String,
        default: '',
    },
    end: {
        type: String,

        default: ''
    },
    date: {
        type: Date,
        default: ''
    },
    qty: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    }
});
module.exports = mongoose.model('bookings', bookingSchema);