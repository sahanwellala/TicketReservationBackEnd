const Train = require('../../models/trainDetails');
const User = require('../../models/userDetails');

module.exports = (app) => {
    app.get('/', (req, res, next) => {
        res.json();
    });


    //This is to get train start stations to the train search
    app.get('/station-list/start', (req, res) => {
        Train.distinct("start").exec().then(stations => {
            // Train.find({}, {start: 1}).exec().then(stations => {
            res.send({
                stations: stations
            });
        }).catch(err => {
            console.error(err);
            res.sendStatus(500);
        })
    });

    //This is to get end stations to the train search
    app.get('/station-list/end', (req, res) => {
        Train.distinct("end").exec().then(stations => {
            // Train.find({}, {start: 1}).exec().then(stations => {
            res.send({
                stations: stations
            });
        }).catch(err => {
            console.error(err);
            res.sendStatus(500);
        })
    });


    // app.get('/station-list/:id', (req, res) => {
    //     Train.findById(req.params.id).exec().then(train => {
    //         res.json(train || {});
    //     }).catch(err => {
    //         console.error(err);
    //         res.sendStatus(500);
    //     })
    // });

    //Register Users
    app.post('/trainReservations/users/register', (req, res) => {
        let fName = req.body.fName;
        let lName = req.body.lName;
        let email = req.body.email;
        let pwd = req.body.pwd;

        if (!fName) {
            return
        }

        if (!lName) {
            return
        }
        if (!email) {
            return
        }
        if (!pwd) {
            return
        }

        email = email.toLowerCase();

        User.find({email: email}, (err, previousUser) => {
            if (err) {
                return res.send('Error Server Error !');
            } else if (previousUser.length > 0) {
                return res.send('Error : Account Already Exists !')
            }

            const user = new User();
            user.fName = fName;
            user.lName = lName;
            user.email = email;
            user.pwd = user.generateHash(pwd);

            user.save((err, user) => {
                if (err) {
                    return res.send({
                        success: false,
                        message: 'Error : Server Error '
                    });
                }

                return res.send({
                    success: true,
                    message: "You are successfully Registered !",
                    user: user
                })
            })

        });

    });

    //get login details of the users
    app.post('/trainReservations/users/login', (req, res) => {
        let email = req.body.email;
        let pwd = req.body.pwd;

        if (!email) {
            return res.send({
                success: false,
                message: "Email Cannot be Empty !"
            })
        }
        if (!pwd) {
            return res.send({
                success: false,
                message: "Password Cannot be Empty !"
            })
        }

        User.find({email: email}, (err, users) => {
            if (err) {
                return res.send({
                    success: false,
                    message: "Error : Server Error !"
                })
            }
            if (users.length !== 1) {
                return res.send({
                    success: false,
                    message: "Error Invalid User Email or Password !"
                })
            }

            const user = users[0];
            if (!user.validPassword(pwd, user.pwd)) {
                return res.send({
                    success: false,
                    message: 'Error : Invalid User Name or Password !'
                })
            }

            return res.send({
                success: true,
                message: 'You are successfully logged in !',
                user: user
            })
        })

    });

    // app.post('/station-list/end', (req, res) => {
    //     let start = req.body.start;
    //     Train.find({"start": start}).exec().then(end => {
    //         res.send({
    //             stations: end
    //         })
    //     }).catch(err => {
    //         res.send({
    //             error: err
    //         })
    //     })
    // });

    //Get the relevant Train Details according to the Start Station and the End Station
    app.get('/station-list/trains/:start/:end', (req, res) => {
        Train.find({"start": req.params.start, "end": req.params.end}).exec().then(trainDetails => {
            res.send({
                trains: trainDetails
            })
        })
    });


    //This is to get the train details when the train ID is given. This will be getting the user selected train ID
    app.get('/station-list/bookings/:id', (req, res) => {
        Train.findById(req.params.id).exec().then(train => {
            res.send({
                start: train.start,
                end: train.end,
                price: train.price,
                id: train._id
            })
        })
    });


    //This is to store the Train Details
    app.post('/station-list', (req, res) => {
        const train = new Train(req.body);
        train.save().then(user => {
            res.json(user);
        }).catch(err => {
            console.error(err);
            res.sendStatus(500);
        })
    });
};