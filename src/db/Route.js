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
                { $limit: limit || 20 }
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
            }, { routesID: 1, _id: 0 }).exec((err, docs) => {
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

    // this.get = (condition, fields) => {
    //     return new Promise((resolve, reject) => {
    //         Schema.find(condition, fields).exec((err, docs) => {
    //             if (err) {
    //                 reject(err);
    //             }
    //             resolve(docs);
    //         });
    //     });
    // }

    // this.getRange = (range, fields) => {
    //     return new Promise((resolve, reject) => {
    //         Schema.find({ID: {$in: range}}, fields).exec((err, docs) => {
    //             if (err) {
    //                 reject(err);
    //             }
    //             resolve(docs);
    //         });
    //     });
    // }

    // this.getOne = (ID) => {
    //     return new Promise((resolve, reject) => {
    //         Schema.findOne({ ID }).exec((err, entity) => {
    //             if (err) {
    //                 reject(err);
    //             }

    //             if (!entity) {
    //                 reject('ID was not found');
    //             }
    //             resolve(entity)
    //         });
    //     });
    // }

    // this.save = (object) => {
    //     return new Promise((resolve, reject) => {

    //         var schema = new Schema(object);

    //         schema.save((err, entity) => {
    //             if (err) {
    //                 reject(err);
    //             }

    //             // io.emit("news", entity);

    //             resolve(entity)
    //         });
    //     });
    // }

    // this.saveMany = (object) => {
    //     return new Promise((resolve, reject) => {
    //         Schema.insertMany(object, (err, entity) => {
    //             if (err) {
    //                 reject(err);
    //             }

    //             // io.emit("news", entity);

    //             resolve(entity)
    //         });
    //     });
    // }

    // this.update = (ID, object) => {
    //     return new Promise((resolve, reject) => {
    //         Schema.findOneAndUpdate({ ID }, object, { new: true, runValidators: true }, (err, entity) => {

    //             if (err) {
    //                 reject(err);
    //             }

    //             if (!entity) {
    //                 reject('ID was not found');
    //             }

    //             // io.emit("updated", entity);

    //             resolve(entity);
    //         });
    //     });
    // }

    // this.updateArray = (ID, object) => {
    //     return new Promise((resolve, reject) => {
    //         Schema.findOneAndUpdate({ ID }, { $addToSet: object }, { new: true, runValidators: true }, (err, entity) => {

    //             if (err) {
    //                 reject(err);
    //             }

    //             if (!entity) {
    //                 reject('ID was not found');
    //             }

    //             // io.emit("updated", entity);

    //             resolve(entity);
    //         });
    //     });
    // }

    // this.delete = (ID) => {
    //     return new Promise((resolve, reject) => {
    //         Schema.findOneAndRemove({ ID }, (err, deletedEntity) => {
    //             if (err) {
    //                 reject(err);
    //             }

    //             if (!deletedEntity) {
    //                 reject('ID was not found')
    //             }

    //             // io.emit("deleted", deletedEntity);

    //             resolve(deletedEntity);
    //         });
    //     });
    // }

    this.prototype = Crud.prototype;
    this.prototype.constructor = this;
}