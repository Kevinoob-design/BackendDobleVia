const { reject } = require("lodash");

module.exports = function (Schema) {

    this.get = (condition, fields) => {
        return new Promise((resolve, reject) => {
            Schema.find(condition, fields).exec((err, docs) => {
                if (err) {
                    reject(err);
                }
                resolve(docs);
            });
        });
    }

    this.getRange = (range, fields) => {
        return new Promise((resolve, reject) => {
            Schema.find({ ID: { $in: range } }, fields).exec((err, docs) => {
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

    this.updateMany = (condition, object) => {
        return new Promise((resolve, reject) => {
            Schema.updateMany(condition, object, { new: true, runValidators: true }, (err, entity) => {

                if (err) {
                    reject(err);
                }

                if (!entity) {
                    reject('ID was not found');
                }

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

    this.count = (filter) => {
        return new Promise((resolve, reject) => {
            Schema.countDocuments(filter).exec((err, count) => {
                if (err) {
                    reject(err);
                }
                resolve(count);
            });
        });
    }
}