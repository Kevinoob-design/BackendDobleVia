module.exports = function (Schema) {

    this.get = () => {
        return new Promise((resolve, reject) => {
            Schema.find({}).exec((err, docs) => {
                if (err) {
                    reject(err);
                }
                resolve(docs);
            });
        });
    }

    this.getNear = (LatLng, distance) => {
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
                }
            ]).then(res => {
                resolve(res);
            }).catch(err => {
                console.log(err);
                reject(err);
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

    this.getOne = (ID) => {
        return new Promise((resolve, reject) => {
            Schema.findOne({ ID }).exec((err, entity) => {
                if (err) {
                    reject(err);
                }

                if (!entity) {
                    reject('ID was not found');
                }
                resolve(entity)
            });
        });
    }

    this.getUserByEmail = (email) => {
        return new Promise((resolve, reject) => {
            Schema.findOne({ email }).exec((err, entity) => {
                if (err) {
                    reject(err);
                }

                if (!entity) {
                    reject('Object was not found');
                }
                resolve(entity)
            });
        });
    }

    this.save = (object) => {
        return new Promise((resolve, reject) => {

            var schema = new Schema(object);

            schema.save((err, entity) => {
                if (err) {
                    reject(err);
                }

                // io.emit("news", entity);

                resolve(entity)
            });
        });
    }

    this.saveMany = (object) => {
        return new Promise((resolve, reject) => {
            Schema.insertMany(object, (err, entity) => {
                if (err) {
                    reject(err);
                }

                // io.emit("news", entity);

                resolve(entity)
            });
        });
    }

    this.update = (ID, object) => {
        return new Promise((resolve, reject) => {
            Schema.findOneAndUpdate({ ID }, object, { new: true, runValidators: true }, (err, entity) => {

                if (err) {
                    reject(err);
                }

                if (!entity) {
                    reject('ID was not found');
                }

                // io.emit("updated", entity);

                resolve(entity);
            });
        });
    }

    this.updateArray = (ID, object) => {
        return new Promise((resolve, reject) => {
            Schema.findOneAndUpdate({ ID }, { $addToSet: object }, { new: true, runValidators: true }, (err, entity) => {

                if (err) {
                    reject(err);
                }

                if (!entity) {
                    reject('ID was not found');
                }

                // io.emit("updated", entity);

                resolve(entity);
            });
        });
    }

    this.delete = (ID) => {
        return new Promise((resolve, reject) => {
            Schema.findOneAndRemove({ ID }, (err, deletedEntity) => {
                if (err) {
                    reject(err);
                }

                if (!deletedEntity) {
                    reject('ID was not found')
                }

                // io.emit("deleted", deletedEntity);

                resolve(deletedEntity);
            });
        });
    }
}