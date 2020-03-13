require('dotenv').config();
require('../config/config');

const app = require('express')();
const mongoose = require('mongoose');

app.use(require('./controllers/Routes'));

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



