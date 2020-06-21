const jwt = require('jsonwebtoken');

//Module class to declare a rehusable RESTfull API that serves as CRUD for Data Base especified Model.
module.exports = function (prefix, app, db) {

    //GET Request to handled to get respective all data from DB instance data for specifed MODEL.
    app.get(`${prefix}/signin`, (req, res) => {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            jwt.verify(req.headers.authorization.split(' ')[1], process.env.jwtKey, (error, data) => {
                if (error) reject(error);
                res.status(200).json({
                    ok: true,
                    resolve: data,
                });
            });
        }

        db.getUserByEmail(req.body).then(resolve => {
            resolve = {
                ID: resolve.ID,
                name: resolve.name,
                lastName: resolve.lastName,
                email: resolve.email,
            }

            jwt.sign({ user: resolve }, process.env.jwtKey, (error, token) => {
                res.status(200).json({
                    ok: true,
                    token: token,
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

    app.get(`${prefix}/all-users`, (req, res) => {
        // console.log(req.originalUrl);
        db.get({ password: 0 }).then(resolve => {
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
    app.post(`${prefix}/create-user`, (req, res) => {

        let body = req.body;
        console.log(body);

        db.saveNewUser(body).then(resolve => {

            resolve = {
                ID: resolve.ID,
                name: resolve.name,
                lastName: resolve.lastName,
                email: resolve.email,
            }

            jwt.sign({ user: resolve }, process.env.jwtKey, (error, token) => {
                res.status(200).json({
                    ok: true,
                    token: token,
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

    //PUT Request to handled the update of existing data from respective DB instance for specifed MODEL.
    app.put(`${prefix}/update-user/:ID`, (req, res) => {

        const ID = req.ID || req.params.ID;
        const body = req.body;
        console.log(body);

        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            jwt.verify(req.headers.authorization.split(' ')[1], process.env.jwtKey, (error, data) => {
                if (error) res.status(400).json({
                    ok: false,
                    err: error
                });

                if(data.user.ID != ID) res.status(400).json({
                    ok: false,
                    err: 'Oops, we could not validate your information'
                });

                if(body.password && !body.oldPassword && !body.newPassword) res.status(400).json({
                    ok: false,
                    err: 'Oops, we could not validate your password'
                });

                db.updateUserInfo(ID, body).then(resolve => {

                    resolve = {
                        ID: resolve.ID,
                        name: resolve.name,
                        lastName: resolve.lastName,
                        email: resolve.email,
                    }
        
                    jwt.sign({ user: resolve }, process.env.jwtKey, (error, token) => {
                        res.status(200).json({
                            ok: true,
                            token: token,
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
    app.delete(`${prefix}/delete-user/:ID`, (req, res) => {

        const ID = req.ID || req.params.ID;
        const body = req.body;
        console.log(req.body);

        jwt.verify(req.headers.authorization.split(' ')[1], process.env.jwtKey, (error, data) => {
            if (error) res.status(400).json({
                ok: false,
                err: error
            });

            console.log(data);

            if(data.user.ID != ID) return res.status(400).json({
                ok: false,
                err: 'Oops, we could not validate your information'
            });

            if(!body.password) return res.status(400).json({
                ok: false,
                err: 'Oops, we could not validate your password'
            });

            db.delete(ID, body.password).then(resolve => {
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
    });
}