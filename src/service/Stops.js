const uuidv4 = require('uuid/v4');
const axios = require('axios');
const distance = require('@turf/distance').default;

//Module class to declare a rehusable RESTfull API that serves as CRUD for Data Base especified Model.
module.exports = function (prefix, app, stopSchema, routeSchema) {

    //GET Request to handled to get respective all data from stopSchema instance data for specifed MODEL.
    app.get(`${prefix}/allStops`, (req, res) => {
        // console.log(req.originalUrl);
        stopSchema.get().then(resolve => {
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

    app.get(`${prefix}/allRoutes`, (req, res) => {
        // console.log(req.originalUrl);
        routeSchema.get().then(resolve => {
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

    app.get(`${prefix}/:ID/routeStops`, (req, res) => {
        const ID = req.ID || req.params.ID;
        stopSchema.getStopsFromRoute(ID).then(sresolve => {
            routeSchema.getOne(ID).then(rresolve => {
                res.status(200).json({
                    ok: true,
                    stop: sresolve,
                    resolve: rresolve,
                });
            }).catch(err => {
                res.status(400).json({
                    ok: false,
                    err
                });
            });
        }).catch(err => {
            res.status(400).json({
                ok: false,
                err
            });
        });
    });

    //GET Request to handled to get one by ID from respective stopSchema instance data for specifed MODEL.
    app.get(`${prefix}/:ID`, (req, res) => {
        const ID = req.ID || req.params.ID;
        stopSchema.getOne(ID).then(resolve => {
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

    //POST Request to handled the creation of new data from respective stopSchema instance for specifed MODEL.
    app.post(prefix, (req, res) => {

        let body = req.body;
        console.log(req.body);

        var oldStops = [];
        var newStops = [];
        var added = 0;

        getSnapedPolylines(req.body['position']).then((trayectory) => {
            stopSchema.get().then(stops => {
                if (stops.length > 0) {

                    for (let i = 0; i < req.body['position'].length; i++) {
                        const position = req.body['position'][i];

                        var isNewStop = '';

                        for (let j = 0; j < stops.length; j++) {
                            const stop = stops[j];

                            var dist = distance(position['LatLng'], stop.location.coordinates, {
                                units: 'kilometers'
                            });

                            if (dist <= 0.15) {
                                console.log(req.body.ID);
                                isNewStop = stop['ID'];
                                oldStops.push(stop);
                            }
                        }

                        if (isNewStop) {
                            stopSchema.updateArray(isNewStop, { routesID: req.body.ID });
                        }
                        else{
                            stopSchema.save({
                                ID: uuidv4(),
                                location: { type: 'Point', coordinates: position['LatLng'] },
                                formattedAddress: position['streetName'],
                                routesID: req.body.ID
                            });
                            added++;
                            newStops.push(stops);
                        }
                    }
                } else {
                    for (let i = 0; i < req.body['position'].length; i++) {
                        const position = req.body['position'][i];

                        newStops.push({
                            ID: uuidv4(),
                            location: { type: 'Point', coordinates: position['LatLng'] },
                            formattedAddress: position['streetName'],
                            routesID: req.body.ID
                        })

                    }
                    stopSchema.saveMany(newStops);
                }

                var obj = req.body;
                obj.trayectory = trayectory;

                routeSchema.save(obj).then(resolve => {
                    res.status(200).json({
                        ok: true,
                        resolve,
                        oldStops,
                        newStops,
                        added,
                        msg: 'Update succesfull',
                    });

                }).catch(err => {
                    console.log(err);
                    res.status(400).json({
                        ok: false,
                        err
                    });
                })
            }).catch(err => {
                console.log(err);
                res.status(400).json({
                    ok: false,
                    err
                });
            });

        }).catch(err => {
            console.log(err);
            res.status(400).json({
                ok: false,
                err
            });
        })
    });

    function getSnapedPolylines(positions) {
        return new Promise((resolve, reject) => {
            var apiKey = process.env.GOOGLE_API_KEY || 'AIzaSyDANio1kmkzoNrYIPkxWAF5P86ZXok1I0U';
            var path = '';

            positions.forEach(position => {
                path = `${path} ${position.LatLng[0]}, ${position.LatLng[1]} |`;
            });

            var removeIndex = path.lastIndexOf('|');
            path = path.substr(0, removeIndex);
            var finalUrl = `https://roads.googleapis.com/v1/snapToRoads?interpolate=true&key=${apiKey}&path=${path}`;

            axios.get(finalUrl).then(response => {

                if (response.status == 200) {
                    console.log(response.data.snappedPoints);

                    var myMap = response.data.snappedPoints;
                    var positions = [];

                    for (var i = 0; i < myMap.length; i++) {

                        // position = [myMap[i]['location']['latitude'], myMap[i]['location']['longitude']]

                        position = { type: 'Point', coordinates: [myMap[i]['location']['latitude'], myMap[i]['location']['longitude']] },

                            positions.push(position);
                    }
                    resolve(positions);
                } else {
                    console.log(response)
                    reject(response);
                }

            }).catch(err => {
                console.log(err);
                reject(err);
            });
        });
    }


    //PUT Request to handled the update of existing data from respective stopSchema instance for specifed MODEL.
    app.put(`${prefix}/:ID`, (req, res) => {

        const ID = req.ID || req.params.ID;
        const body = req.body;
        console.log(body);

        stopSchema.update(ID, body).then(resolve => {
            res.status(200).json({
                ok: true,
                resolve: 'Update succesfull',
            });
        }).catch(err => {
            res.status(400).json({
                ok: false,
                err
            });
        });
    });

    //This PUT request is to update existing Array on a Existing object in the model.
    app.put(`${prefix}/:ID/updateOne`, (req, res) => {

        const ID = req.ID || req.params.ID;
        const body = req.body;
        console.log(body);

        stopSchema.updateArray(ID, body).then(resolve => {
            res.status(200).json({
                ok: true,
                resolve: 'Update succesfull',
            });
        }).catch(err => {
            res.status(400).json({
                ok: false,
                err
            });
        });
    });

    //DELETE Request to handled the deletion of existing data from respective stopSchema instance for specifed MODEL.
    app.delete(`${prefix}/:ID`, (req, res) => {

        const ID = req.ID || req.params.ID;
        console.log(req.body);

        stopSchema.delete(ID).then(resolve => {
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