require('dotenv').config();
require('../config/config');

const app = require('express')();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.DBURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}, (err, res) => {

    if (err) {
        throw err;
    }

    console.log("Data Base Online");
});

const Crud = require('./controllers/DbController');
const Route = require('./models/Route');
const crud = new Crud(Route);

require('./controllers/api')('/route', app, crud);

app.listen(process.env.PORT, () => {
    console.log(`Listening on port: ${process.env.PORT}`);
});



