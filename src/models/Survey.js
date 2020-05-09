const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

//This Schema is to evaluate the rating of the different route available in the system.
let surveySchema = new Schema({
    routeID: {
        type: String,
        required: [true, 'The route ID must be provided'],
    },
    userID: {
        type: String,
        required: [true, 'a user ID must be provided'],
    },
    raiting: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: false
    },
    timeStamp: {
        type: Date,
        required: true
    }
});

surveySchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});

module.exports = mongoose.model('survey', surveySchema);