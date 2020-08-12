const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

//This schema is for every stop that will be added in terms of the trayectory of a spicified route.
let stopSchema = new Schema({
    ID:{
        type: String,
        required: [true, 'The route ID must be provided'],
        unique: true
    },
    location:{
        type:{
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates:{
            type: [Number],
            index: '2dsphere',
            required: true
        }
    },
    transportType: {
        type: String,
        required: true
    },
    formattedAddress: String,
    routesID: [String],
    record: {
        createdDate: {
            type: Date,
            default: Date.now,
            required: true
        },
        createdBy: {
            type: String,
            default: 'System',
            required: true
        },
    }
});

stopSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});

module.exports = mongoose.model('stop', stopSchema);