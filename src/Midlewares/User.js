// Declaring thirdparty libraries to be used on first party middleware.
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

// Export of JS Class that serve as first party middleware
module.exports = function (db) {

    // Verify type of Request and redirect to hadleler method.
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

    this.verifyUser = (req) => {
        return new Promise((resolve, reject) => {
            if (req.headers['authorization']) {
                jwt.verify(req.headers['authorization'], process.env.jwtKey, (error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        db.getOne(data.ID).then(result => {
                            resolve(result);
                        }).catch(err => {
                            reject(err);
                        });
                    }
                });
            } else if (req.headers['email'] && req.headers['password']) {
                db.getUserByEmail(req.headers['email']).then(result => {
                    bcrypt.compare(req.headers['password'], result.password, (error, confirmed) => {
                        if(confirmed){
                            resolve(result);
                        }else{
                            reject('Usuario o contrasena incorrectos');
                        }
                    });
                }).catch(err => {
                    reject(err);
                });
            }
            else {
                reject();
            }
        })
    }

    this.envryptPassword = (req) => {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(Number(process.env.saltRounds), (err, salt) => {
                if (err) {
                    reject(err);
                } else {
                    bcrypt.hash(req.body.password, salt, function (err, hash) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(hash);
                        }
                    });
                }
            })
        });
    }

    // Verify a given USER Token or asswell Credentias such as User/Email and Password
    this.getUser = (req, res, next) => {
        this.verifyUser(req).then(result => {
            jwt.sign({ ID: result.ID }, process.env.jwtKey, (error, token) => {
                res.json({
                    ok: true,
                    token,
                    resolve: {
                        ID: result.ID,
                        name: result.name,
                        lastName: result.lastName,
                        email: result.email,
                    }
                })
            });
        }).catch(err => {
            res.json({
                ok: false,
                err
            });
        })
    }

    // Creates a new user with password encryptions and generates a token that will be returned to client.
    this.createUser = (req, res, next) => {
        this.envryptPassword(req).then(hash => {
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
        }).catch(err => {

        });
    }

    this.updateUser = (req, res, next) => {
        this.verifyUser(req).then(resolve => {
            if(typeof req.body.password !== 'undefined'){
                console.log(req.body.password);
                this.envryptPassword(req).then(hash => {
                    req.ID = resolve.ID;
                    req.body.password = hash;
                    next();
                }).catch(err => {
                    res.json({
                        ok: false,
                        err
                    });
                })
            }else{
                req.ID = resolve.ID;
                next();
            }
        }).catch(err => {
            res.json({
                ok: false,
                err
            });
        })
    }

    this.deleteUser = (req, res, next) => {
        this.verifyUser(req).then(resolve => {
            req.ID = resolve.ID;
            next();
        }).catch(err => {
            res.json({
                ok: false,
                err
            });
        })
    }
}