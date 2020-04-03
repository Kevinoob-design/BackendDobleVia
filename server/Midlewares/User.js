//Declaring thirdparty libraries to be used on first party middleware.
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

//Export of JS Class that serve as first party middleware
module.exports = function (db) {

    //Verify type of Request and redirect to hadleler method.
    this.verifyUsers = (req, res, next) => {
        switch (req.method) {
            case 'GET':
                this.getUser(req, res, next);
                break;
            case 'POST':
                this.createUser(req, res, next);
                break;
            case 'PUT':
                this.updateUser(req, res, next);
                break;
            case 'DELETE':
                this.deleteUser(req, res, next);
                break;
            default:
                break;
        }
    }

    //Verify a given USER Token or asswell Credentias such as User/Email and Password
    this.getUser = (req, res, next) => {
        if (req.headers['authorization']) {
            jwt.verify(req.headers['authorization'], process.env.jwtKey, (error, data) => {
                if (error) {
                    res.json({
                        from: req.method,
                        error
                    })
                } else {
                    db.getOne(data.ID).then(resolve => {
                        res.status(200).json({
                            ok: true,
                            resolve: {
                                name: resolve.name,
                                lastName: resolve.lastName,
                                email: resolve.email
                            },
                        });
                    }).catch(err => {
                        res.status(400).json({
                            ok: false,
                            err
                        });
                    });
                }
            });
        } else if (req.headers['email'] && req.headers['password']) {
            db.getUserByEmail(req.headers['email']).then(resolve => {
                bcrypt.compare(req.headers['password'], resolve.password, (error, result) => {
                    if (result) {
                        jwt.sign({ ID: resolve.ID }, process.env.jwtKey, (error, token) => {
                            if (error) {
                                res.status(200).json({
                                    ok: true,
                                    token: error,
                                    resolve: {
                                        name: resolve.name,
                                        lastName: resolve.lastName,
                                        email: resolve.email
                                    },
                                });
                            }else{
                                res.status(200).json({
                                    ok: true,
                                    token,
                                    resolve: {
                                        name: resolve.name,
                                        lastName: resolve.lastName,
                                        email: resolve.email
                                    },
                                });
                            }
                        });
                    } else {
                        res.status(403).json({
                            ok: false,
                            message: 'Usuario o contasena incorrecto',
                        });
                    }
                });
            }).catch(err => {
                res.status(400).json({
                    ok: false,
                    err
                });
            });
        }
        else {
            res.sendStatus(403);
        }
    }

    //Creates a new user with password encryptions and generates a token that will be returned to client.
    this.createUser = (req, res, next) => {
        bcrypt.genSalt(Number(process.env.saltRounds), (err, salt) => {
            if (err) {
                res.json({
                    message: "error salting",
                    err: err.message
                })
            } else {
                bcrypt.hash(req.body.password, salt, function (err, hash) {
                    if (err) {
                        res.json({
                            message: "error encrypting",
                            err: err.message
                        })
                    } else {
                        const user = {
                            ID: uuidv4(),
                            name: _.upperFirst(req.body.name),
                            lastName: _.upperFirst(req.body.lastName),
                            email: req.body.email,
                            password: hash,
                            role: 'USER'
                        }

                        jwt.sign({ ID: user.ID }, process.env.jwtKey, (error, token) => {
                            error ? req.token = error : req.token = token;
                            req.body = user;
                            next();
                        });
                    }
                });
            }
        })
    }

    this.updateUser = (req, res, next) => {
        res.json({
            from: req.method
        })
    }

    this.deleteUser = (req, res, next) => {
        res.json({
            from: req.method
        })
    }
}