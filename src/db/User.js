const User = require('../models/User');
const uuidv4 = require('uuid/v4');
const _ = require('lodash');

module.exports = function () {
    this.getOne = (ID) => {
        return new Promise((resolve, reject) => {
            User.findOne({ ID }).exec((err, entity) => {
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

    this.getUserByEmail = (credentials) => {
        return new Promise((resolve, reject) => {
            User.findOne({ email: credentials.email }).exec(async (err, entity) => {
                if (err) {
                    return reject(err);
                }

                if (!entity) {
                    return reject('Username does not exist');
                }

                const user = new User(entity);

                if (await user.verifyPassword(credentials.password)) return resolve(entity);

                reject('Username or password incorrect');
            });
        });
    }

    this.getAllUsers = (fields) => {
        return new Promise((resolve, reject) => {
            User.find({}, fields).exec((err, docs) => {
                if (err) {
                    reject(err);
                }
                resolve(docs);
            });
        });
    }

    this.saveNewUser = (object) => {
        return new Promise((resolve, reject) => {

            var user = new User({
                ID: uuidv4(),
                name: _.upperFirst(object.name),
                lastName: _.upperFirst(object.lastName),
                password: object.password,
                email: _.toLower(object.email),
            });

            user.save((err, entity) => {
                if (err) {
                    reject(err);
                }

                resolve(entity);
            });
        });
    }

    this.updateUserInfo = (ID, object) => {
        return new Promise((resolve, reject) => {

            if (object.oldPassword && object.newPassword) {
                User.findOne({ ID }).exec(async (err, entity) => {
                    if (err) {
                        return reject(err);
                    }

                    if (!entity) {
                       return reject('Username does not exist');
                    }

                    const user = new User(entity);

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
                User.findOneAndUpdate({ ID }, object, { new: true, runValidators: true }, (err, entity) => {

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

            User.findOne({ ID }).exec(async (err, entity) => {
                if (err) {
                    return reject(err);
                }

                if (!entity) {
                   return reject('Username does not exist');
                }

                const user = new User(entity);

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
}