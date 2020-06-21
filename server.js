// Basic required configuration
require('dotenv').config();
require('./config/config');

// Server declaration
const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'client/build')));

// Third party middlewares definitions
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Third party Middlewares injections
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Database connection with URI link AUTH
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

// CRUD definition
const Crud = require('./src/db/Crud');

// DB definition
const UserDB = require('./src/db/User');

// Models definition
const Route = require('./src/models/Route');
const Intersection = require('./src/models/Intersection');
const User = require('./src/models/User');
const Survey = require('./src/models/Survey');
const Contact = require('./src/models/Contact');
const Feedback = require('./src/models/Feedback');
const Issue = require('./src/models/Issue');

// First party Middleware definitions
const KeyMiddleWare = require('./src/Midlewares/Key');
// const UserMiddleWare = require('./src/Midlewares/User');

// First party Middleware instances
const keyMiddleWare = new KeyMiddleWare();
// const userMiddleWare = new UserMiddleWare(new Crud(User));

// First party Middlewares injections
app.use('/api', keyMiddleWare.verifyKey);
// app.use('/api/user', userMiddleWare.verifyUsers);

// Routes definition with Models
require('./src/service/General')('/api/route', app, new Crud(Route));
require('./src/service/Stops')('/api/newroute', app, new Crud(Intersection), new Crud(Route));
require('./src/service/User')('/api/user', app, new UserDB());
require('./src/service/General')('/api/survey', app, new Crud(Survey));
require('./src/service/General')('/api/contact', app, new Crud(Contact));
require('./src/service/General')('/api/feedback', app, new Crud(Feedback));
require('./src/service/General')('/api/issue', app, new Crud(Issue));

// Starting server on PORT
app.listen(process.env.PORT, () => {
    console.log(`Listening on port: ${process.env.PORT}`);
});