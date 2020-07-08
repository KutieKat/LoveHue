const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const PostCategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    seo_slug: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    show_on_menu: {
        type: Number,
        default: 1
    },
    is_active: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

PostCategorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('PostCategory', PostCategorySchema);