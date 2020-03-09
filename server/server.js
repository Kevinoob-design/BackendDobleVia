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

var io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('------------------------------alooooooooooooooooooooooooooo: ', socket.id);

    io.sockets.emit('send_message', '----------------Este es el otro alooooooooooo');

    // socket.on('receive_message', () => {
    //     io.sockets.emit('send_message', '----------------Este es el otro alooooooooooo');
    // });

    // io.on("send_message", (data) => {
    //     console.log('----------------Este es el otro alooooooooooo');
    //     io.broadcast.emit("receive_message", data)
    // })
});



