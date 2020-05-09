const uuidv4 = require('uuid/v4');

//Module class to declare a rehusable RESTfull API that serves as CRUD for Data Base especified Model.
module.exports = function (prefix, app, stopSchema, routeSchema) {

    //GET Request to handled to get respective all data from stopSchema instance data for specifed MODEL.
    app.get(prefix, (req, res) => {
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

        var stops;
        var added = 0;

        req.body['position'].forEach(async position => {

            var resolve = await stopSchema.getNear(position['LatLng'], 200);
            
            if (resolve.length > 0) {
                console.log(resolve[0]['ID']);
                console.log(req.body.ID);
                var resolve = await stopSchema.updateArray(resolve[0]['ID'], { routesID: req.body.ID });
            }
            else {
                var resolve = await stopSchema.save({
                    ID: uuidv4(),
                    location: { type: 'Point', coordinates: req.body['position'][0]['LatLng'] },
                    formattedAddress: position['streetName'],
                    routesID: req.body.ID
                });
                added++;
            }

            stops = resolve;
        });

        routeSchema.save(req.body).then(resolve => {
            res.status(200).json({
                ok: true,
                resolve,
                stops,
                added,
                msg: 'Update succesfull',
            });

        }).catch(err => {
            res.status(400).json({
                ok: false,
                err
            });
        })
    });

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