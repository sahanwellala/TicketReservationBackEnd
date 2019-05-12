const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const StationRoutes = express.Router();
const PORT = 4000;
const server = require('repl');

app.use(cors());
app.use(bodyParser.json());
app.use('/station-list', StationRoutes);
app.use('/trainReservation', StationRoutes);

mongoose.connect('mongodb://127.0.0.1:27017/trainReservation', {useNewUrlParser: true})
    .then(() => {
        return server.start();
    }).catch(err => {
    console.error(err);
    process.exit(1);
});

require('./routes/api/trainData')(app);
const connection = mongoose.connection;
connection.once('open', function () {
    console.log('MongoDB connection established Successfully !');
});

app.listen(PORT, function () {
    console.log("Server is Running on PORT : " + PORT);
});


