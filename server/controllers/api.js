module.exports = function (prefix, app, db) {

    app.get(prefix, (req, res) => {
        // console.log(req);
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

    app.get(`${prefix}/:ID`, (req, res) => {
        let ID = req.params.ID;
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

    app.post(prefix, (req, res) => {

        let body = req.body;
        console.log(body);

        db.save(body).then(resolve => {
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

    app.put(`${prefix}/:ID`, (req, res) => {

        let ID = req.params.ID;
        let body = req.body;
        console.log(body);

        db.update(ID, body).then(resolve => {
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

    app.delete(`${prefix}/:ID`, (req, res) => {

        let ID = req.params.ID;
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