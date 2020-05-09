const uuidv4 = require('uuid/v4');

module.exports = function (StopDB, RouteDB) {

    this.verifyStop = (req, res, next) => {
        switch (req.method) {
            case 'GET':
                this.getStop(req, res, next);
                break;
            case 'POST':
                this.createStop(req, res, next);
                break;
            case 'PUT':
                this.updateStop(req, res, next);
                break;
            case 'DELETE':
                this.deleteStop(req, res, next);
                break;
            default:
                break;
        }
    }

    this.getStop = (req, res, next) => {
        StopDB.get().then(resolve => {
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

    this.createStop = (req, res, next) => {
        console.log(res.body);
        res.send(res.body);
    }

    this.updateStop = (req, res, next) => {
        res.send('PUT');

    }

    this.deleteStop = (req, res, next) => {
        next();
    }
}