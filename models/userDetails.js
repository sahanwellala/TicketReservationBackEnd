const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
let userSchema = new mongoose.Schema({
    fName: {
        type: String,
        default: ''
    },
    lName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    pwd: {
        type: String,
        default: ''
    }
});
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
userSchema.methods.validPassword = function (password, dbPassword) {
    return bcrypt.compareSync(password, dbPassword);
};
module.exports = mongoose.model('user', userSchema);