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

const http = require('http').createServer(app)

var io = require('socket.io')(http);

io.on('connection', (socket) => {
    console.log('------------------------------alooooooooooooooooooooooooooo');
});

io.on("send_message", (data) => {
    console.log('----------------Este es el otro alooooooooooo');
    io.broadcast.emit("receive_message", data)
})

