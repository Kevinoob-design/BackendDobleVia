const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let routeSchema = new Schema({
    ownerID: {  
        type: String,
        required: [true, 'The owner ID most be provided'],
    },
    ID: {
        type: String,
        required: [true, 'The route ID must be provided'],
        unique: true
    },
    routeName: {
        type: String,
        required: [true, 'The route name must be provided']
    },
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
    trayectory: [{
        type: {
            type: String,
            enum: ['Point'],
            required: [true, 'The location type must be provided']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere',
            required: [true, 'The polyline coordinates must be provided']
        }
    }],
    position: {
        type: [{
            LatLng: [Number],
            streetName: String,
        }],
        required: [true, 'The polyline positions must be provided']
    },
    active: {
        type: Boolean,
        default: true,
        required: true
    },
    status: {
        statusCode: {
            type: String,
            enum : ['ACTIVE','REVIEW', 'DISABLED'],
            default: 'REVIEW',
            required: true
        },
        statusReason: {
            type: String,
            default: 'Pending review',
            required: true
        }
    },
    created: {
        createdDate: {
            type: Date,
            default: Date.now,
            required: true
        },
        createdBy: {
            fullName: {
                type: String,
                default: 'System',
                required: true
            },
            ID: {
                type: String,
                default: 'NaN',
                required: true
            },
        },
    },
    record: {
        lastModified: {
            by: {
                fullName: {
                    type: String,
                    default: 'System',
                    required: true
                },
                ID: {
                    type: String,
                    default: 'NaN',
                    required: true
                },
            },
            timeStamp: {
                type: Date,
                default: Date.now,
                required: true
            }
        },
    }
});

routeSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});

module.exports = mongoose.model('route', routeSchema);