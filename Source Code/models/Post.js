const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const PostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    seo_slug: {
        type: String,
        unique: true,
        required: true
    },
    summary: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    post_category: {
        type: Schema.Types.ObjectId,
        ref: 'PostCategory',
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String,
        default: ''
    }],
    source: {
        type: String,
        default: ''
    },
    is_active: {
        type: Number,
        default: 1
    },
    is_hot: {
        type: Number,
        default: 0
    },
    thumbnail_image_file_name: {
        type: String,
        default: ''
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

PostSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', PostSchema);