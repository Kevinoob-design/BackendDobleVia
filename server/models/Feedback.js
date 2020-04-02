const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let feedbackSchema = new Schema({
    rating: {
        type: Number,
    },
    review: {
        userID: {
            type: String,
            required: false
        },
        comment: {
            type: String,
            required: true
        }
    },
    improvements: {
        userID: {
            type: String,
            required: false
        },
        comment: {
            type: String,
            required: false
        }
    }
});

routeSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});

module.exports = mongoose.model('feedback', feedbackSchema);