const express = require('express');
const Route = require('../models/Route');
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = app.listen(process.env.PORT, () => {
    console.log("Listening on port: ",
        process.env.PORT);
});

const io = require('socket.io')(server);

io.on('connection', (socket) => { 
    console.log('The socket ID of the device: ' + socket.id);
    console.log('The client is: ' + socket.client.request);
});

app.get('/route', (req, res) => {

    // console.log(req);

    io.emit("news", "outside the on");

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

    let body = req.body;
    console.log(body);

    let route = new Route({
        routeID: body.routeID,
        routeName: body.routeName,
        schedule: body.schedule,
        price: body.price,
        destination: body.destination,
        aditionalInfo: body.aditionalInfo,
        position: body.position
    });

    console.log(route);

    route.save((err, routeDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        
        io.emit("news", routeDB);

        res.status(201).json({
            ok: true,
            route: routeDB
        });

    });

});

app.put('/route/:routeID', (req, res) => {

    let routeID = req.params.routeID;
    let body = req.body;
    console.log(body);

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
    console.log(req.body)

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