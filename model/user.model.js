const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /.+\@.+\..+/
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phone:{
        type: String,
        required: true,
        minlength: 10,
        maxlength: 10,
    },
},{
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;