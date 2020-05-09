//Module class to declare a rehusable RESTfull API that serves as CRUD for Data Base especified Model.
module.exports = function (prefix, app, db) {

    //GET Request to handled to get respective all data from DB instance data for specifed MODEL.
    app.get(prefix, (req, res) => {
        // console.log(req.originalUrl);
        db.get().then(resolve => {
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
    app.post(prefix, (req, res) => {

        let body = req.body;
        console.log(body);

        db.save(body).then(resolve => {
            res.status(200).json({
                ok: true,
                token: req.token,
                resolve,
            });
        }).catch(err => {
            res.status(400).json({
                ok: false,
                err
            });
        });

    });

    //PUT Request to handled the update of existing data from respective DB instance for specifed MODEL.
    app.put(`${prefix}/:ID`, (req, res) => {

        const ID = req.ID || req.params.ID;
        const body = req.body;
        console.log(body);

        db.update(ID, body).then(resolve => {
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

        db.updateArray(ID, body).then(resolve => {
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

    //DELETE Request to handled the deletion of existing data from respective DB instance for specifed MODEL.
    app.delete(`${prefix}/:ID`, (req, res) => {

        const ID = req.ID || req.params.ID;
        console.log(req.body);

        db.delete(ID).then(resolve => {
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

// const server = app.listen(process.env.PORT, () => {
//     console.log("Listening on port: ",
//         process.env.PORT);
// });

// const io = require('socket.io')(server);

// io.on('connection', (socket) => {
//     console.log('The socket ID of the device: ' + socket.id);
//     console.log('The client is: ' + socket.client.request);
// });