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
            if (error) return res.status(400).json({
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

    app.put(`${prefix}/transferRoute/:ID`, (req, res) => {
        if (!req.headers.authorization || !req.headers.authorization.split(' ')[0] === 'Bearer') return res.status(403).json({
            ok: false,
            msg: 'You must be loged in'
        });

        if (!req.params.ID && !req.body.newOwner) return res.status(403).json({
            ok: false,
            msg: 'Error validating requirerd params'
        });

        jwt.verify(req.headers.authorization.split(' ')[1], process.env.jwtKey, (error, data) => {
            if (error) res.status(400).json({
                ok: false,
                err: error
            });

            if (data.user.role != 'ADMIN') return res.status(403).json({
                ok: false,
                msg: 'You do not have the permission for this'
            });

            routeSchema.get({ ID: req.params.ID, ownerID: data.user.ID }).then(resolveValidation => {
                if (!resolveValidation) return res.status(403).json({
                    ok: false,
                    msg: 'This route does not belongs to you'
                });

                routeSchema.update(req.params.ID, { $set: { ownerID: req.body.newOwner } }).then(resolve => {
                    res.status(200).json({
                        ok: true,
                        resolve,
                        msg: 'Transfer succesfull'
                    });
                }).catch(err => {
                    res.status(400).json({
                        ok: false,
                        err
                    });
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
                                transfers: [[{
                                    "ID": nearFrom[0].routesID,
                                    "street": nearFrom[0].formattedAddress
                                },
                                ],
                                [{
                                    "ID": nearTo[0].routesID,
                                    "street": nearTo[0].formattedAddress
                                }]
                                ],
                                suggested: [suggested],
                                // from: nearFrom,
                                // to: nearTo
                            }
                        });
                    });
                } else {
                    routeSchema.get({}, { ID: 1, _id: 0 }).then(routesID => {
                        stopSchema.getStopCollissions().then(async collissions => {

                            routesID = routesID.map(routes => routes.ID);
                            collissions = collissions.map(collission => { return { ID: collission.routesID, street: collission.formattedAddress } });

                            const from = nearFrom.map(from => { return { ID: from.routesID[0], street: from.formattedAddress[0] } });
                            const to = nearTo.map(to => { return { ID: to.routesID.map(routeID => routeID), street: to.formattedAddress[0] } });

                            const searchEngine = new SearchEngine(routesID, collissions);

                            let filter = searchEngine.bfs(from[0], to[0]);
                            // searchEngine.dfs(from[0][0], to[0]);

                            // return res.status(200).json({
                            //     ok: true,
                            //     resolve: {
                            //         routesID: filter,
                            //         from: nearFrom,
                            //         to: nearTo
                            //     }
                            // });

                            const suggested = [];
                            let arrayID = filter.map(filterParent => filterParent.map(filterId => filterId.ID));
                            arrayID = arrayID.filter((t = {}, a => !(t[a] = a in t)));

                            const seen = new Set();
                            filter = filter.filter(el => {
                                const e = el.map(e => e.ID)
                                const duplicate = seen.has(e[1]);
                                seen.add(e[1]);
                                return !duplicate;
                            });

                            for (const ids of arrayID) {
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

                            // let stopToStop = [];

                            // suggested.map((map1, i) => {
                            //     const indexes = [];
                            //     map1.map((map2, j) => {
                            //         const street = filter[i][j];
                            //         let index

                            //         if(j == 0) {
                            //             index = map2.position.filter(index => index.streetName == street.street); 
                            //             indexes.push(index[0].index);
                            //         }
                            //         if(j == 1) {
                            //             index = map2.position.filter(index => index.streetName == street.streetTransferStart[0] || street.streetTransferStart); 
                            //             indexes.push(index[0].index);
                            //         }
                            //         if(typeof street.streetTransferStart != 'string' && street.streetTransferStart?.[1]) {
                            //             index = map2.position.filter(index => index.streetName == street.streetTransferStart[1]); 
                            //             indexes.push(index[0].index);
                            //         }
                            //         if(j == 2) {
                            //             index = map2.position.filter(index => index.streetName == street.streeTransfertEnd); 
                            //             indexes.push(index[0].index);
                            //         }
                            //     });

                            //     console.log(indexes);
                            // });

                            // routeSchema.getPositionRanges()

                            res.status(200).json({
                                ok: true,
                                resolve: {
                                    transfers: filter,
                                    suggested,
                                    // from: nearFrom,
                                    // to: nearTo
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

                let obj = req.body;
                console.log(obj);

                obj.ownerID = data.user.ID;

                obj.position = obj.position.map((pos, i) => {
                    pos.index = i
                    return pos;
                });

                if (!obj.trayectory || !obj.trayectory.length || !obj.trayectory.length == 0) {
                    getSnapedPolylines(req.body.position).then((trayectory) => {
                        obj.trayectory = trayectory;
                        routeSchema.save(obj).then(resolve => {
                            if (!resolve) return res.status(200).json({
                                ok: false,
                                resolve,
                                msg: 'Update unsuccesful',
                            });

                            res.status(200).json({
                                ok: true,
                                resolve,
                                msg: 'Update succesfull',
                            });
                            calculateNearStops(obj, obj.ID);
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
                        if (!resolve) return res.status(200).json({
                            ok: false,
                            resolve,
                            msg: 'Update unsuccesful',
                        });

                        res.status(200).json({
                            ok: true,
                            resolve,
                            msg: 'Update succesfull',
                        });
                        calculateNearStops(obj, obj.ID);
                    }).catch(err => {
                        console.log(err);
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

    function calculateNearStops(body, routeID) {
        return new Promise((resolve, reject) => {
            var newStops = [];

            body.position.forEach(pos => {
                stopSchema.getNear(pos.LatLng, 150, 1).then(near => {
                    if (near.length > 0) return stopSchema.updateArray(near[0].ID,
                        {
                            routesID: routeID,
                            formattedAddress: pos.streetName,
                            transportType: body.aditionalInfo.transportType
                        });
                }).catch(err => {
                    console.log(err);
                });

                newStops.push({
                    ID: uuidv4(),
                    location: { type: 'Point', coordinates: pos.LatLng },
                    formattedAddress: [pos.streetName],
                    transportType: [body.aditionalInfo.transportType],
                    routesID: [routeID]
                });
            });

            stopSchema.saveMany(newStops).then(docs => {
                console.log('success stops');
                resolve('Succesfull');
            }).catch(err => {
                console.log(err);
                reject(err);
            });
        });
    }

    function getSnapedPolylines(positions) {
        return new Promise((resolve, reject) => {
            var apiKey = process.env.GOOGLE_API_KEY;
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

                    body.position = body.position.map((pos, i) => {
                        pos.index = i
                        return pos;
                    });

                    if (body.redoTrayectory == true) {
                        getSnapedPolylines(body['position']).then(trayectory => {
                            body.trayectory = trayectory;
                            routeSchema.update(ID, body).then(resolve => {
                                if (!resolve) return res.status(200).json({
                                    ok: false,
                                    resolve,
                                    msg: 'Update unsuccesful',
                                });

                                res.status(200).json({
                                    ok: true,
                                    msg: 'Update succesfull',
                                    resolve
                                });
                                calculateNearStops(body.newStops, ID);
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
                            if (!resolve) return res.status(200).json({
                                ok: false,
                                resolve,
                                msg: 'Update unsuccesful',
                            });

                            res.status(200).json({
                                ok: true,
                                msg: 'Update succesfull',
                                resolve
                            });
                            calculateNearStops(body.newStops, ID);
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

    // app.put(`${prefix}/add/index`, (req, res) => {
    //     routeSchema.get({ID: req.body.ID}, {}).then(doc => {

    //         const lol = doc[0];

    //         lol.position = lol.position.map((pos, i) => {
    //             pos.index = i
    //             return pos;
    //         });

    //         routeSchema.update(req.body.ID, {$set: {position: lol.position} }).then(resolve => {
    //             res.status(200).json({
    //                 ok: true,
    //                 resolve: lol.position,
    //             });
    //         }).catch(err => {
    //             res.status(400).json({
    //                 ok: false,
    //                 err
    //             });
    //         });
    //     });
    // });

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