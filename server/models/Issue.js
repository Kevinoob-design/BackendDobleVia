const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let issueSchema = new Schema({
    userID: {
        type: String,
        required: false
    },
    issue: {
        type: String,
        required: true
    }
});

routeSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});

module.exports = mongoose.model('issue', issueSchema);