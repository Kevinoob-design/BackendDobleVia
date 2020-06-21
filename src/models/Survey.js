const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

//This Schema is to evaluate the rating of the different route available in the system.
let surveySchema = new Schema({
    ID: {
        type: String,
        required: [true, 'Route ID most be provided and an existing one']
    },
    userID: {
        type: String,
        required: [true, 'User ID most be provided and an existing one']
    },
    raiting: {
        type: String,
        required: [true, 'valid raiting most be provided']
    },
    userName: {
        type: String,
        required: [true, 'Full name most be provided']
    },
    reviewTitle: {
        type: String,
        required: false
    },
    comment: {
        type: String,
        required: false
    },
    timeStamp: {
        type: Date,
        default: Date.now
    }
});

surveySchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});

module.exports = mongoose.model('survey', surveySchema);