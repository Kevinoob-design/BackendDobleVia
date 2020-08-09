const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const _ = require('lodash');

//Module class to declare a rehusable RESTfull API that serves as CRUD for Data Base especified Model.
module.exports = function (prefix, app, db) {

    app.get(`${prefix}/count`, (req, res) => {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            jwt.verify(req.headers.authorization.split(' ')[1], process.env.jwtKey, (error, data) => {
                if (error) res.status(400).json({
                    ok: false,
                    err: error
                });

                console.log(data);

                if (data.user.role != 'ADMIN') {
                    res.status(403).json({
                        ok: false,
                        msg: 'You do not have the permission for this'
                    });
                } else {
                    let filter = req.body || {};
                    console.log(filter);
                    db.count(filter).then(resolve => {
                        res.status(200).json({
                            ok: true,
                            resolve,
                        });
                    }).catch(err => {
                        res.status(400).json({
                            ok: false,
                            err
                        });
                    });
                }
            });
        } else {
            res.status(403).json({
                ok: false,
                msg: 'You do not have the permission for this'
            });
        }
    });

    //GET Request to handled to get respective all data from DB instance data for specifed MODEL.
    app.post(`${prefix}/signin`, (req, res) => {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            jwt.verify(req.headers.authorization.split(' ')[1], process.env.jwtKey, (error, data) => {
                if (error) reject(error);
                console.log(`Loged in with token: ${Date.now()}`);
                req.body = data.user;
            });
        }

        console.log(req.body);

        db.getUserByEmail(req.body).then(resolve => {
            resolve.password = req.body.password;
            jwt.sign({ user: resolve }, process.env.jwtKey, { expiresIn: '48h' }, (error, token) => {
                resolve.password = undefined;
                res.status(200).json({
                    ok: true,
                    token,
                    resolve,
                });

                resolve.updateOne({
                    lastLogedIn: Date.now(),
                    $push: { logedInLogs: Date.now() }
                }).then(resolve => {
                    console.log(`Loged in: ${Date.now()}`);
                    console.log(resolve);
                }).catch(err => {
                    console.log(err);
                })
            });
        }).catch(err => {
            res.status(400).json({
                ok: false,
                err
            });
        });
    });

    app.get(`${prefix}/all-users`, (req, res) => {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            jwt.verify(req.headers.authorization.split(' ')[1], process.env.jwtKey, (error, data) => {
                if (error) res.status(400).json({
                    ok: false,
                    err: error
                });

                console.log(data);

                if (data.user.role != 'ADMIN') {
                    res.status(403).json({
                        ok: false,
                        msg: 'You do not have the permission for this'
                    });
                } else {
                    db.get({}, { password: 0 }).then(resolve => {
                        res.status(200).json({
                            ok: true,
                            resolve,
                        });
                    }).catch(err => {
                        res.status(400).json({
                            ok: false,
                            err
                        });
                    });
                }
            });
        } else {
            res.status(403).json({
                ok: false,
                msg: 'You do not have the permission for this'
            });
        }
    });

    //GET Request to handled to get one by ID from respective DB instance data for specifed MODEL.
    app.get(`${prefix}/:ID`, (req, res) => {
        const ID = req.ID || req.params.ID;
        db.getOne(ID).then(resolve => {
            res.status(200).json({
                ok: true,
                resolve,
            });
        }).catch(err => {
            res.status(400).json({
                ok: false,
                err
            });
        });
    });

    //POST Request to handled the creation of new data from respective DB instance for specifed MODEL.
    app.post(`${prefix}/signup`, (req, res) => {

        let body = {
            ID: uuidv4(),
            name: _.upperFirst(req.body.name),
            lastName: _.upperFirst(req.body.lastName),
            fullName: _.toUpper(`${req.body.name} ${req.body.lastName}`),
            password: req.body.password,
            email: _.toLower(req.body.email),
        };
        console.log(body);

        db.save(body).then(resolve => {
            jwt.sign({ user: resolve }, process.env.jwtKey, { expiresIn: '48h' }, (error, token) => {
                resolve.password = undefined;
                res.status(200).json({
                    ok: true,
                    token,
                    resolve,
                });
            });
        }).catch(err => {
            res.status(400).json({
                ok: false,
                err
            });
        });

    });

    app.post(`${prefix}/create-user`, (req, res) => {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            jwt.verify(req.headers.authorization.split(' ')[1], process.env.jwtKey, (error, data) => {
                if (error) res.status(400).json({
                    ok: false,
                    err: error
                });

                if (data.user.role != 'ADMIN') return res.status(403).json({
                    ok: false,
                    msg: 'You do not have the permission for this'
                });

                let body = {
                    ID: uuidv4(),
                    name: req.body.name,
                    lastName: req.body.lastName,
                    fullName: _.toUpper(`${req.body.name} ${req.body.lastName}`),
                    email: req.body.email,
                    password: req.body.password,
                    role: req.body.role,
                    active: req.body.active,
                    created: {
                        createdBy: {
                            fullName: data.user.fullName,
                            ID: data.user.ID
                        }
                    },
                    record: {
                        lastModified: {
                            by: {
                                fullName: data.user.fullName,
                                ID: data.user.ID
                            }
                        }
                    }
                }
                console.log(body);

                db.save(body).then(resolve => {
                    res.status(200).json({
                        ok: true,
                        resolve,
                    });
                }).catch(err => {
                    res.status(400).json({
                        ok: false,
                        err
                    });
                });
            });
        }
    });

    app.put(`${prefix}/update-user`, (req, res) => {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            jwt.verify(req.headers.authorization.split(' ')[1], process.env.jwtKey, (error, data) => {
                if (error) res.status(400).json({
                    ok: false,
                    err: error
                });

                if (data.user.role != 'ADMIN') return res.status(403).json({
                    ok: false,
                    msg: 'You do not have the permission for this'
                });

                const ID = req.body.ID;

                let body = {
                    role: req.body.role,
                    active: req.body.active,
                    record: {
                        lastModified: {
                            by: {
                                fullName: data.user.fullName,
                                ID: data.user.ID
                            },
                            timeStamp: Date.now()
                        },
                    }
                }
                console.log(body);

                db.update(ID, body).then(resolve => {
                    res.status(200).json({
                        ok: true,
                        msg: 'Update succesfull',
                        resolve,
                    });
                }).catch(err => {
                    res.status(400).json({
                        ok: false,
                        err
                    });
                });
            });
        }
    });

    //PUT Request to handled the update of existing data from respective DB instance for specifed MODEL.
    app.put(`${prefix}/update/:ID`, (req, res) => {

        const ID = req.ID || req.params.ID;
        console.log(req.body);

        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            jwt.verify(req.headers.authorization.split(' ')[1], process.env.jwtKey, (error, data) => {
                if (error) return res.status(400).json({
                    ok: false,
                    err: error
                });

                if (data.user.ID != ID) return res.status(400).json({
                    ok: false,
                    err: 'Oops, we could not validate your information'
                });

                if (req.body.password && !req.body.oldPassword && !req.body.newPassword) return res.status(400).json({
                    ok: false,
                    err: 'Oops, we could not validate your password'
                });

                const name = (data.user.name != req.body.name) ? req.body.name : data.user.name;
                const lastName = (data.user.lastName != req.body.lastName) ? req.body.lastName : data.user.lastName

                let body = {
                    name: name,
                    lastName: lastName,
                    fullName: `${name} ${lastName}`,
                    oldPassword: req.body.oldPassword,
                    newPassword: req.body.newPassword,
                    record: {
                        lastModified: {
                            by: {
                                fullName: data.user.fullName,
                                ID: data.user.ID
                            },
                            timeStamp: Date.now()
                        },
                    }
                }

                db.update(ID, body).then(resolve => {
                    resolve.password = body.newPassword || undefined;
                    jwt.sign({ user: resolve }, process.env.jwtKey, { expiresIn: '48h' }, (error, token) => {
                        resolve.password = undefined;
                        res.status(200).json({
                            ok: true,
                            token,
                            msg: 'Update succesfull',
                            resolve,
                        });
                    });
                }).catch(err => {
                    res.status(400).json({
                        ok: false,
                        err
                    });
                });

            });
        }
    });

    //DELETE Request to handled the deletion of existing data from respective DB instance for specifed MODEL.
    app.delete(`${prefix}/delete/:ID`, (req, res) => {

        const ID = req.ID || req.params.ID;
        const body = req.body;
        console.log(req.body);

        jwt.verify(req.headers.authorization.split(' ')[1], process.env.jwtKey, (error, data) => {
            if (error) res.status(400).json({
                ok: false,
                err: error
            });

            console.log(data);

            if (data.user.ID != ID) return res.status(400).json({
                ok: false,
                err: 'Oops, we could not validate your information'
            });

            if (!req.headers.password) return res.status(400).json({
                ok: false,
                err: 'Oops, we could not validate your password'
            });

            db.delete(ID, req.headers.password).then(resolve => {
                res.status(200).json({
                    ok: true,
                    msg: 'User deleted succesfully',
                });
            }).catch(err => {
                res.status(400).json({
                    ok: false,
                    err
                });
            });

        });
    });
}