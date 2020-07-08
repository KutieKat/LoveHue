const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    full_name: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    gender: {
        type: Number,
        default: 0
    },
    date_of_birth: {
        type: Date,
        default: null
    },
    phone: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    role: {
        type: Number,
        default: 0
    },
    avatar_file_name: {
        type: String,
        default: ''
    },
    is_active: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', UserSchema);