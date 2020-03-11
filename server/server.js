require('dotenv').config();
require('../config/config');

const app = require('express')();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

const server = app.listen(process.env.PORT, () => {
    console.log("Listening on port: ",
        process.env.PORT);
});

const io = require('socket.io')(server);

io.on('connection', (socket) => {

    // socket.on('message', async (message) => {
    //     console.log('I got this-------- ' + message);

    //     const {routeDB} = await require('./controllers/Routes');

    //     console.log(routeDB);

    //     io.sockets.emit('news', routeDB);
    // });
});



