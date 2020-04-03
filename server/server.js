//Basic required configuration
require('dotenv').config();
require('../config/config');

//Server declaration
const app = require('express')();

//Third party middlewares definitions
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

//Third party Middlewares injections
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Database connection with URI link AUTH
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

// Models definition
const Crud = require('./controllers/DbController');
const Route = require('./models/Route');
const User = require('./models/User');

//First party Middleware definitions
const UserMiddleWare = require('./Midlewares/User');
const userMiddleWare = new UserMiddleWare(new Crud(User));

//First party Middlewares injections
app.use('/user/', userMiddleWare.verifyUsers);


// Routes definition with Models
require('./controllers/api')('/route', app, new Crud(Route));
require('./controllers/api')('/user', app, new Crud(User));

//Starting server on PORT
app.listen(process.env.PORT, () => {
    console.log(`Listening on port: ${process.env.PORT}`);
});