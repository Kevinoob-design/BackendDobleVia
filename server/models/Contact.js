const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let contactSchema = new Schema({
    userID: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    contactInfo: {
        email: {
            type: String,
            required: true
        },
        telephone: {
            type: Number,
            required: true
        },
    },
    reason: {
        type: String,
        required: true
    }
});

routeSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});

module.exports = mongoose.model('contact', contactSchema);