const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

//This Schema is to evaluate the rating of the different route available in the system.
let surveySchema = new Schema({
    ID: {
        type: String,
        required: [true, 'The route ID must be provided'],
        unique: true
    },
    stats: {
        raitings: [[Number]],
        ratingAmount: {
            type: Number,
            required: false
        }
    },
    review: [{
        userID: {
            type: String,
            required: false
        },
        comment: {
            type: String,
            required: false
        }
    }]
});

surveySchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});

module.exports = mongoose.model('survey', surveySchema);