const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const BenefitSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon_file_name: {
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

BenefitSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Benefit', BenefitSchema);