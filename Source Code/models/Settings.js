const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingsSchema = new Schema({
    title: {
        type: String,
        default: ''
    },
    slogan: {
        type: String,
        default: ''
    },
    logo_url: {
        type: String,
        default: ''
    },
    favicon_url: {
        type: String,
        default: ''
    },
    banner_url: {
        type: String,
        default: ''
    },
    facebook_url: {
        type: String,
        default: ''
    },
    twitter_url: {
        type: String,
        default: ''
    },
    instagram_url: {
        type: String,
        default: ''
    },
    pinterest_url: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('Settings', SettingsSchema);