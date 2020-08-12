const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const distance = require('@turf/distance').default;
const SearchEngine = require('../controller/search');
const { reject } = require('lodash');

//Module class to declare a rehusable RESTfull API that serves as CRUD for Data Base especified Model.
module.exports = function (prefix, app, stopSchema, routeSchema) {

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
                    routeSchema.count(filter).then(resolve => {
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

    app.post(`${prefix}/setDetails/:ID`, (req, res) => {
        if (!req.headers.authorization || !req.headers.authorization.split(' ')[0] === 'Bearer') return res.status(403).json({
            ok: false,
            msg: 'You do not have the permission for this'
        });

        if (!req.params.ID && !req.body.details) return res.status(403).json({
            ok: false,
            msg: 'Error validating requirerd params'
        });

        jwt.verify(req.headers.authorization.split(' ')[1], process.env.jwtKey, (error, data) => {
            if (error) res.status(400).json({
                ok: false,
                err: error
            });

            if (data.user.role != 'PROVIDER') return res.status(403).json({
                ok: false,
                msg: 'You do not have the permission for this'
            });

            let filter = req.body || {};
            console.log(filter);
            routeSchema.update(req.params.ID, { $set: { 'aditionalInfo.details': req.body.details } }).then(resolve => {
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

    app.post(`${prefix}/setWarning/:ID`, (req, res) => {
        if (!req.headers.authorization || !req.headers.authorization.split(' ')[0] === 'Bearer') return res.status(403).json({
            ok: false,
            msg: 'You do not have the permission for this'
        });

        if (!req.params.ID && !req.body.warning) return res.status(403).json({
            ok: false,
            msg: 'Error validating requirerd params'
        });

        jwt.verify(req.headers.authorization.split(' ')[1], process.env.jwtKey, (error, data) => {
            if (error) res.status(400).json({
                ok: false,
                err: error
            });

            if (data.user.role != 'PROVIDER') return res.status(403).json({
                ok: false,
                msg: 'You do not have the permission for this'
            });

            let filter = req.body || {};
            console.log(filter);
            routeSchema.update(req.params.ID, { $set: { 'aditionalInfo.warnings': req.body.warning } }).then(resolve => {
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
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            jwt.verify(req.headers.authorization.split(' ')[1], process.env.jwtKey, (error, data) => {
                if (error) return res.status(400).json({
                    ok: false,
                    error
                });

                console.log(data);

                if (data.user.role != 'ADMIN' && data.user.role != 'PROVIDER') return res.status(403).json({
                    ok: false,
                    msg: 'You do not have the permission for this'
                });

                let condition;

                switch (data.user.role) {
                    case 'ADMIN': condition = {}
                        break;

                    case 'PROVIDER': condition = { ownerID: data.user.ID }
                        break;

                    default:
                        break;
                }

                routeSchema.get(condition).then(resolve => {
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
        } else {
            res.status(403).json({
                ok: false,
                msg: 'You do not have the permission for this'
            });
        }
    });

    app.post(`${prefix}/routes-in-range`, (req, res) => {
        // console.log(req.originalUrl);
        routeSchema.getRange(req.body.range).then(resolve => {
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

    //GET Request to return the nearest stop from latitude and longitud provided in rage of 500m
    app.post(`${prefix}/nearest`, (req, res) => {
        console.log(req.body);
        stopSchema.getNear(req.body.coordinates, parseInt(req.body.distance)).then(resolve => {
            const ids = resolve.map(stop => stop.routesID.toString());
            routeSchema.getRange(ids).then(nearestRoutes => {
                res.status(200).json({
                    ok: true,
                    resolve,
                    nearestRoutes
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

    app.post(`${prefix}/search`, (req, res) => {
        console.log(req.body);
        stopSchema.getNear(req.body.coordinates.from, 1000, 1).then(nearFrom => {
            stopSchema.getNear(req.body.coordinates.to, 1000, 1).then(nearTo => {

                let isSame;

                if (!nearFrom || !nearTo) return res.status(400).json({
                    ok: false,
                    msg: 'There was no near routes found close origin nor destination'
                });

                for (let i = 0; i < nearFrom.length; i++) {
                    const from = nearFrom[i];
                    isSame = from.routesID.filter(function (fromID) {
                        let conllissions;

                        for (let j = 0; j < nearTo.length; j++) {
                            const to = nearTo[j];
                            conllissions = to.routesID.filter(function (toID) {
                                return toID == fromID;
                            });
                        }
                        return conllissions.length > 0 ? true : false;
                    });
                }

                if (isSame.length > 0) {
                    routeSchema.getRange(isSame).then(suggested => {
                        res.status(200).json({
                            ok: true,
                            resolve: {
                                suggested: [suggested],
                                from: nearFrom,
                                to: nearTo
                            }
                        });
                    });
                } else {
                    routeSchema.get({}, { ID: 1, _id: 0 }).then(routesID => {
                        stopSchema.getStopCollissions().then(async collissions => {

                            routesID = routesID.map(routes => routes.ID);
                            collissions = collissions.map(collission => collission.routesID);
                            const from = nearFrom.map(from => from.routesID);
                            const to = nearTo.map(to => to.routesID.map(routeID => routeID));

                            const searchEngine = new SearchEngine(routesID, collissions);

                            console.log(`Options for from: ${from[0]}`);
                            console.log(`Options for to: ${to[0]}`);

                            const filter = searchEngine.bfs(from[0][0], to[0]);
                            // searchEngine.dfs(from[0][0], to[0]);

                            console.log(filter);
                            const suggested = [];

                            for (const ids of filter) {
                                await routeSchema.getRange(ids).then(resolve => {
                                    console.log(ids);

                                    for (let i = 0; i < resolve.length; i++) {
                                        const r = resolve[i].ID;
                                        const id = ids[i];

                                        if (r != id) {
                                            const locationId = ids.findIndex((innerId) => innerId == id);
                                            const locationR = resolve.findIndex((route) => route.ID == id);

                                            const temp = resolve[locationId];
                                            resolve[locationId] = resolve[locationR];
                                            resolve[locationR] = temp;
                                        }
                                    }

                                    suggested.push(resolve);
                                });
                            }

                            console.log(suggested);

                            res.status(200).json({
                                ok: true,
                                resolve: {
                                    routesID: filter,
                                    suggested,
                                    from: nearFrom,
                                    to: nearTo
                                }
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
                }
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

    app.get(`${prefix}/search`, (req, res) => {
        const ID = req.ID || req.params.ID;
        stopSchema.getOne().then(resolve => {
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
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            jwt.verify(req.headers.authorization.split(' ')[1], process.env.jwtKey, (error, data) => {
                if (error) return res.status(400).json({
                    ok: false,
                    error
                });

                console.log(data);

                if (data.user.role != 'ADMIN' && data.user.role != 'PROVIDER') return res.status(403).json({
                    ok: false,
                    msg: 'You do not have the permission for this'
                });

                let body = req.body;
                console.log(req.body);

                var oldStops = [];
                var newStops = [];
                var closeStops = [];
                var added = 0;

                stopSchema.get().then(stops => {
                    if (stops.length > 0) {

                        for (let i = 0; i < req.body['position'].length; i++) {
                            const position = req.body['position'][i];

                            var isOldStop = '';
                            var isCloseStop = '';

                            for (let j = 0; j < stops.length; j++) {
                                const stop = stops[j];

                                var dist = distance(position['LatLng'], stop.location.coordinates, {
                                    units: 'kilometers'
                                });

                                if (dist <= 0.50) {
                                    console.log(`Very close stop: ${req.body.ID}`);
                                    isOldStop = stop['ID'];
                                    oldStops.push(stop);
                                }

                                if (dist <= 0.300) {
                                    console.log(`Close enough: ${req.body.ID}`);
                                    isCloseStop = stop['ID'];
                                    closeStops.push(stop);
                                }
                            }

                            if (isOldStop) {
                                stopSchema.updateArray(isOldStop, { routesID: req.body.ID });

                                if (req.body.aditionalInfo.transportType == 'metro' || req.body.aditionalInfo.transportType == 'teleferico') {
                                    stopSchema.save({
                                        ID: uuidv4(),
                                        location: { type: 'Point', coordinates: position['LatLng'] },
                                        formattedAddress: position['streetName'],
                                        transportType: req.body.aditionalInfo.transportType,
                                        routesID: req.body.ID
                                    });
                                    added++;
                                    newStops.push(stops);
                                }
                            }
                            else {
                                const ID = uuidv4();
                                stopSchema.save({
                                    ID: ID,
                                    location: { type: 'Point', coordinates: position['LatLng'] },
                                    formattedAddress: position['streetName'],
                                    transportType: req.body.aditionalInfo.transportType,
                                    routesID: req.body.ID
                                });
                                added++;
                                newStops.push(stops);

                                if (isCloseStop) {
                                    stopSchema.updateArray(isCloseStop, { routesID: req.body.ID });
                                    stopSchema.updateArray(ID, { routesID: isCloseStop });
                                }
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
                    obj.ownerID = data.user.ID;

                    obj.position = obj.position.map((pos, i) => {
                        return {
                            ...pos,
                            index: 1
                        }
                    });

                    if (!obj.trayectory || !obj.trayectory.length || !obj.trayectory.length == 0) {
                        getSnapedPolylines(req.body['position']).then((trayectory) => {
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
                            });

                        }).catch(err => {
                            console.log(err);
                            res.status(400).json({
                                ok: false,
                                err
                            });
                        });
                    } else {
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
                        });
                    }
                }).catch(err => {
                    console.log(err);
                    res.status(400).json({
                        ok: false,
                        err
                    });
                });
            });
        } else {
            res.status(403).json({
                ok: false,
                msg: 'You do not have the permission for this'
            });
        }
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

                        position = { type: 'Point', coordinates: [myMap[i]['location']['latitude'], myMap[i]['location']['longitude']] };
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

    app.post(`${prefix}/getSnaped`, (req, res) => {
        if (!req.body || !req.body.length || !req.body.length <= 10) return res.status(400).json({ msg: 'Falta informacion de trayectoria' });
        getSnapedPolylines(req.body).then(trayectory => {
            res.status(200).json({
                ok: true,
                msg: 'Trayectoria se calculo correctamente',
                trayectory
            }).catch(err => {
                res.status(400).json({
                    ok: false,
                    msg: 'Algo salio mal, verifique que las coordenadas estan cerca o pertenecen a una calle o misma via',
                    error: err
                })
            })
        })
    });

    //PUT Request to handled the update of existing data from respective stopSchema instance for specifed MODEL.
    app.put(`${prefix}/:ID`, (req, res) => {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            jwt.verify(req.headers.authorization.split(' ')[1], process.env.jwtKey, (error, data) => {
                if (error) return res.status(400).json({
                    ok: false,
                    error
                });

                console.log(data);

                if (data.user.role != 'ADMIN' && data.user.role != 'PROVIDER') return res.status(403).json({
                    ok: false,
                    msg: 'You do not have the permission for this'
                });

                const ID = req.ID || req.params.ID;
                const body = req.body;
                console.log(body);

                routeSchema.get({ ID, ownerID: data.user.ID }).then(resolveValidation => {

                    console.log(resolveValidation);

                    if (resolveValidation[0].ID != ID && resolveValidation[0].ownerID != data.user.ID) return res.status(403).json({
                        ok: false,
                        msg: 'This route does not belongs to you'
                    });

                    if (body.redoTrayectory == true) {
                        getSnapedPolylines(body['position']).then(trayectory => {
                            body.trayectory = trayectory;
                            routeSchema.update(ID, body).then(resolve => {
                                res.status(200).json({
                                    ok: true,
                                    msg: 'Update succesfull',
                                    resolve
                                });
                            }).catch(err => {
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
                        });
                    } else {
                        routeSchema.update(ID, body).then(resolve => {
                            res.status(200).json({
                                ok: true,
                                msg: 'Update succesfull',
                                resolve
                            });
                        }).catch(err => {
                            res.status(400).json({
                                ok: false,
                                err
                            });
                        });
                    }
                }).catch(err => {
                    res.status(400).json({
                        ok: false,
                        err
                    });
                });
            });
        } else {
            res.status(403).json({
                ok: false,
                msg: 'You do not have the permission for this'
            });
        }
    });

    //This PUT request is to update existing Array on a Existing object in the model.
    app.put(`${prefix}/:ID/updateOne`, (req, res) => {

        const ID = req.ID || req.params.ID;
        const body = req.body;
        console.log(body);

        routeSchema.updateArray(ID, body).then(resolve => {
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
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            jwt.verify(req.headers.authorization.split(' ')[1], process.env.jwtKey, (error, data) => {
                if (error) return res.status(400).json({
                    ok: false,
                    error
                });

                console.log(data);

                if (data.user.role != 'ADMIN' && data.user.role != 'PROVIDER') return res.status(403).json({
                    ok: false,
                    msg: 'You do not have the permission for this'
                });

                const ID = req.ID || req.params.ID;

                routeSchema.get({ ID, ownerID: data.user.ID }, {}).then(resolveValidation => {

                    console.log(resolveValidation);

                    if (resolveValidation[0].ID != ID && resolveValidation[0].ownerID != data.user.ID) return res.status(403).json({
                        ok: false,
                        msg: 'This route does not belongs to you'
                    });

                    routeSchema.delete(ID).then(routeDeleted => {
                        stopSchema.updateMany({ routesID: ID }, { $pull: { routesID: ID } }).then(stopDeleted => {
                            res.status(200).json({
                                ok: true,
                                resolve: {
                                    routeDeleted,
                                    stopDeleted
                                },
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

                }).catch(err => {
                    res.status(400).json({
                        ok: false,
                        err: 'This route does not belongs to you'
                    });
                });
            });
        } else {
            res.status(403).json({
                ok: false,
                msg: 'You do not have the permission for this'
            });
        }
    });
}