module.exports = function(Schema) {

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