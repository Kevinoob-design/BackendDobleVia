const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let routeSchema = new Schema({
    routeID: {
        type: String,
        required: [true, 'The route ID must be provided'],
        unique: true
    },
    routeName: {
        type: String,
        required: [true, 'The route name must be provided']
    },
    position: {
        type: [{
            LatLng: [],
        }],
        required: [true, 'The polyline positions must be provided']
    }
});

routeSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});

module.exports = mongoose.model('route', routeSchema);