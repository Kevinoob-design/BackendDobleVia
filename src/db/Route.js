const Crud = require('./Crud');

module.exports = function (Schema) {

    Crud.apply(this, arguments);

    this.getNear = (LatLng, distance, limit) => {
        return new Promise((resolve, reject) => {
            Schema.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: LatLng },
                        distanceField: "dist.calculated",
                        maxDistance: distance,
                        includeLocs: "dist.location",
                        spherical: true
                    }
                },
                { $limit: limit || 20 },
                // { "$project": { "_id": 1, "ID": 1, "dist": 1, "location": 1 } }
            ]).then(res => {
                resolve(res);
            }).catch(err => {
                console.log(err);
                reject(err);
            });
        });
    }

    this.getStopCollissions = () => {
        return new Promise((resolve, reject) => {

            Schema.find({
                $nor: [
                    { routesID: { $exists: false } },
                    { routesID: { $size: 0 } },
                    { routesID: { $size: 1 } }
                ]
            }, { routesID: 1, formattedAddress: 1 }).exec((err, docs) => {
                if (err) {
                    reject(err);
                }
                resolve(docs);
            });
        });
    }

    this.getStopsFromRoute = (ID) => {
        return new Promise((resolve, reject) => {
            Schema.find({ routesID: { $all: [ID] } }).exec((err, docs) => {
                if (err) {
                    reject(err);
                }
                resolve(docs);
            });
        });
    }

    this.prototype = Crud.prototype;
    this.prototype.constructor = this;
}