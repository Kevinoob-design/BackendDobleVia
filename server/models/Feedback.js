const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

//This Schema is for internal use ONLY, this will let administrators of the app know where they can improve and what their users think about the app.
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

feedbackSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});

module.exports = mongoose.model('feedback', feedbackSchema);