const mongoose = require('mongoose');
let trainSchema = new mongoose.Schema({
    start: {
        type: String,
        default: ''
    },
    end: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0.0
    }
});
module.exports = mongoose.model('train', trainSchema);