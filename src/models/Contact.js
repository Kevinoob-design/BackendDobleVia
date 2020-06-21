const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

//This schema is for internal use ONLY, this will allow users to get in contact with administrators for any given reason.
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
    },
    record: {
        createdDate: {
            type: Date,
            default: Date.now,
            required: true
        },
        lastModified: {
            by: {
                type: String,
                required: true
            },
            timeStamp: {
                type: Date,
                default: Date.now,
                required: true
            }
        },
        createdBy: {
            type: String,
            default: 'System',
            required: true
        },
    }
});

contactSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});

module.exports = mongoose.model('contact', contactSchema);