// Basic required configuration
require('dotenv').config();
require('../config/config');

// Server declaration
const app = require('express')();

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
const Crud = require('./controllers/DbController');

// Models definition
const Route = require('./models/Route');
const User = require('./models/User');
const Survey = require('./models/Survey');
const Contact = require('./models/Contact');
const Feedback = require('./models/Feedback');
const Issue = require('./models/Issue');

// First party Middleware definitions
const KeyMiddleWare = require('./Midlewares/Key');
const UserMiddleWare = require('./Midlewares/User');

// First party Middleware instances
const keyMiddleWare = new KeyMiddleWare();
const userMiddleWare = new UserMiddleWare(new Crud(User));

// First party Middlewares injections
app.use(keyMiddleWare.verifyKey);
app.use('/user', userMiddleWare.verifyUsers);

// Routes definition with Models
require('./controllers/api')('/api/route', app, new Crud(Route));
require('./controllers/api')('/api/user', app, new Crud(User));
require('./controllers/api')('/api/survey', app, new Crud(Survey));
require('./controllers/api')('/api/contact', app, new Crud(Contact));
require('./controllers/api')('/api/feedback', app, new Crud(Feedback));
require('./controllers/api')('/api/issue', app, new Crud(Issue));

// Starting server on PORT
app.listen(process.env.PORT, () => {
    console.log(`Listening on port: ${process.env.PORT}`);
});