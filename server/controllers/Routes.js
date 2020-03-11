const express = require('express');
const Route = require('../models/Route');

const app = express();

app.get('/route', (req, res) => {

    let since = req.query.since || 0;
    since = Number(since);

    Route.find({})
        .skip(since)
        .exec((err, routes) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Route.countDocuments({}, (err, counts) => {
                res.status(200).json({
                    ok: true,
                    routes,
                    count: counts
                });
            });

        });

});

app.get('/route/:routeID', (req, res) => {

    let routeID = req.params.routeID;

    Route.findOne({
            routeID
        })
        .exec((err, route) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!route) {
                return res.status(404).json({
                    ok: false,
                    err: {
                        message: 'Route was not found'
                    }
                });
            }

            res.status(200).json({
                ok: true,
                route
            });

        });

});

app.post('/route', (req, res) => {
    // console.log(req);
    let body = req.body;
    console.log(body);
    console.log(body.position);

    let route = new Route({
        routeID: body.routeID,
        routeName: body.routeName,
        position: body.position,
    });

    route.save((err, routeDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        exports.routeDB = routeDB;

        res.status(201).json({
            ok: true,
            route: routeDB
        });

    });

});

app.put('/route/:routeID', (req, res) => {

    let routeID = req.params.routeID;
    let body = req.body;

    Route.findOneAndUpdate({
        routeID
    }, body, {
        new: true,
        runValidators: true
    }, (err, routeDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!routeDB) {
            return res.status(404).json({
                ok: false,
                err: {
                    message: 'Route was not found'
                }
            });
        }

        res.status(200).json({
            ok: true,
            route: routeDB
        });

    });

});

app.delete('/route/:routeID', (req, res) => {

    let routeID = req.params.routeID;

    Route.findOneAndRemove({
        routeID
    }, (err, deletedRoute) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!deletedRoute) {
            return res.status(404).json({
                ok: false,
                err: {
                    message: 'Route was not found'
                }
            });
        }

        res.status(200).json({
            ok: true,
            route: deletedRoute
        });

    });


});


module.exports = app;