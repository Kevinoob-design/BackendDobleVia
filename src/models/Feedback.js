const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

//This Schema is for internal use ONLY, this will let administrators of the app know where they can improve and what their users think about the app.
let feedbackSchema = new Schema({
    userID: {
        type: String,
        required: false,
        unique: true
    },
    rating: {
        type: Number,
    },
    review: {
        type: String,
        required: true
    },
    improvements: {
        type: String,
        required: false
    },
    record: {
        createdDate: {
            type: Date,
            default: Date.now,
            required: true
        }
    }
});

feedbackSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});

module.exports = mongoose.model('feedback', feedbackSchema);