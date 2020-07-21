const Crud = require('./Crud');

module.exports = function (Schema) {

    Crud.apply(this, arguments);

    this.getUserByEmail = (credentials) => {
        return new Promise((resolve, reject) => {
            Schema.findOne({ email: credentials.email, active: true }).exec(async (err, entity) => {
                if (err) {
                    return reject(err);
                }

                if (!entity) {
                    return reject('Username does not exist');
                }

                const user = new Schema(entity);

                if (await user.verifyPassword(credentials.password)) return resolve(entity);

                reject('Username or password incorrect');
            });
        });
    }

    this.update = (ID, object) => {
        return new Promise((resolve, reject) => {

            if (object.oldPassword && object.newPassword) {
                Schema.findOne({ ID }).exec(async (err, entity) => {
                    if (err) {
                        return reject(err);
                    }

                    if (!entity) {
                       return reject('Username does not exist');
                    }

                    const user = new Schema(entity);

                    if (!await user.verifyPassword(object.oldPassword)) return reject('Username or password incorrect');

                    user.password = object.newPassword;

                    user.save((err, entity) => {

                        if (err) {
                            reject(err);
                        }

                        if (!entity) {
                            reject('Unable to update user');
                        }

                        resolve(entity);
                    });
                });
            } else {
                Schema.findOneAndUpdate({ ID }, {$set: object}, { new: true, runValidators: true }, (err, entity) => {

                    if (err) {
                        reject(err);
                    }

                    if (!entity) {
                        reject('ID was not found');
                    }

                    resolve(entity);
                });
            }
        });
    }

    this.delete = (ID, password) => {
        return new Promise((resolve, reject) => {

            Schema.findOne({ ID }).exec(async (err, entity) => {
                if (err) {
                    return reject(err);
                }

                if (!entity) {
                   return reject('Username does not exist');
                }

                const user = new Schema(entity);

                if (!await user.verifyPassword(password)) return reject('Password incorrect');

                user.deleteOne((err, entity) => {

                    if (err) {
                        reject(err);
                    }

                    if (!entity) {
                        reject('Unable to delete user');
                    }

                    resolve(entity);
                });
            });
        });
    }

    // this.getAllUsers = (fields) => {
    //     return new Promise((resolve, reject) => {
    //         Schema.find({}, fields).exec((err, docs) => {
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

    // this.saveNewUser = (object) => {
    //     return new Promise((resolve, reject) => {

    //         var user = new User(object);

    //         user.save((err, entity) => {
    //             if (err) {
    //                 reject(err);
    //             }

    //             resolve(entity);
    //         });
    //     });
    // }

    this.prototype = Crud.prototype;
    this.prototype.constructor = this;
}