const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let routeSchema = new Schema({
    ID: {
        type: String,
        required: [true, 'The route ID must be provided'],
        unique: true
    },
    routeName: {
        type: String,
        required: [true, 'The route name must be provided']
    },
    review: [{
        raiting: {
            type: String,
            required: true
        },
        userID: {
            type: String,
            required: true
        },
        userName: {
            type: String,
            required: true
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
    }],
    schedule: {
        startTime: {
            type: String,
            required: [true, 'There moust be a start time provided']
        },
        endTime: {
            type: String,
            required: [true, 'There moust be a end time provided']
        },
        interval: {
            type: String,
            required: [false]
        },
    },
    price: {
        type: String,
        required: [true, 'The route must have a price']
    },
    destination: {
        type: String,
        required: [true, 'The final destination must be specified']
    },
    aditionalInfo: {
        transportType: String,
        details: String,
        warnings: String,
    },
    position: {
        type: [{
            LatLng: [],
            streetName: String,
        }],
        required: [true, 'The polyline positions must be provided']
    }
});

routeSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});

module.exports = mongoose.model('route', routeSchema);