const Train = require('../../models/trainDetails');
const User = require('../../models/userDetails');
const Bookings = require('../../models/bookingDetails');
const nodemailer = require('nodemailer');
const pwd = require('../../credentials/email');

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

    //Check whether the email exists
    app.post('/users/check-email', (req, res, next) => {
        let email = req.body.email;
        if (!email) {
            return res.send({
                error: "Email Cannot be Empty",
                success: false
            })
        }
        email = email.toLowerCase();
        User.find({email: email}, (err, previousUsers) => {
            if (err) {
                return res.send({
                    error: "Server Error"
                })
            } else if (previousUsers.length > 0) {
                return res.send({
                    success: false,
                    error: "Already Exists !",
                    count: previousUsers.length
                });
            }
            return res.send({
                success: true,
                count: previousUsers.length
            })
        })
    });

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

    //Sampath Bank Credit Card Service

    app.post('/sampath/creditCard/validation', (req, res) => {
        let cardName = req.body.cardName;
        let cardNum = req.body.cardNum;
        let cvcNum = req.body.cvcNum;
        let exDate = req.body.exDate;
        let totalBill = req.body.totalBill;


        if (!cardName) {
            return res.send({
                success: false,
                message: "Card Name Cannot be Empty !"
            })
        }

        if (!cardNum) {
            return res.send({
                success: false,
                message: "Card Number Cannot be Empty !"
            })
        }
        if (!cvcNum) {
            return res.send({
                success: false,
                message: "CVC Number Cannot be Empty !"
            })
        }
        if (!exDate) {
            return res.send({
                success: false,
                message: "Expiration Date Cannot be Empty !"
            })
        }
        if (!totalBill) {
            return res.send({
                success: false,
                message: "Total Bill Cannot be Empty !"
            })
        }

        if (cardNum === '1234567812345678' && cvcNum === '123') {
            let details = {
                cardName,
                cardNum,
                cvcNum,
                exDate,
                totalBill
            };

            return res.send({
                success: true,
                message: "Payment Completed Successfully !",
                details: details
            })
        }

        return res.send({
            success: false,
            message: "Cannot Validate the Payment Request !",
        })

    });

    //To send emails when a booking is done
    app.post('/bookings/sendMail', (req, res) => {

        let to = req.body.to;
        let subject = req.body.subject;
        let content = req.body.content;

        if (!to) {
            return res.send({
                success: false,
                message: 'Error : Recipient Cannot be Empty !'
            })
        }

        if (!subject) {
            return res.send({
                success: false,
                message: 'Error : Subject Cannot be Empty !'
            })
        }

        if (!content) {
            return res.send({
                success: false,
                message: 'Error : '
            })
        }
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: pwd.email,
                pass: pwd.pwd
            }
        });

        const mailOptions = {
            from: pwd.email,
            to: to,
            subject: subject,
            html: content
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                return res.send(info.response);
            }
        });

    });

    //Validate Government User via the NIC

    app.post('/gov/employee/validate', (req, res) => {
        let nic = req.body.nic;
        if (!nic) {
            return res.send({
                success: false,
                message: "Error : NIC Cannot be Empty !"
            })
        }
        if (nic === '902230245V') {
            return res.send({
                success: true,
                message: "This is a Government Employee",
                empID: 'E001'
            })
        }
        return res.send({
            success: false,
            message: 'Not a Government Employee'
        })
    });

    //Dialog Payment Gate Way Authorization using Mobile Number and PIN

    app.post('/dialog/bill/auth', (req, res) => {
        let mobileNumber = req.body.mobileNum;
        let pin = req.body.pinNum;
        let amount = req.body.amount;

        if (!mobileNumber) {
            return res.send({
                success: false,
                message: 'Error : Mobile Number cannot be Empty !'
            })
        }
        if (!pin) {
            return res.send({
                success: false,
                message: 'Error : PIN cannot be Empty !'
            })
        }

        if (mobileNumber === '0771234567' && pin === '1234') {
            return res.send({
                success: true,
                message: 'Payment Successful. Rs. ' + amount + ' added to your Dialog mobile: ' + mobileNumber + ' bill'
            })
        }
        return res.send({
            success: false,
            message: 'Failed to Validate the Mobile Payment Request !'
        })
    });

    //Add Train Booking Details to the Database
    app.post('/bookings/add', (req, res) => {

        let userID = req.body.userID;
        let start = req.body.start;
        let end = req.body.end;
        let date = req.body.date;
        let qty = req.body.qty;
        let total = req.body.total;

        if (!userID) {
            return res.send({
                success: false,
                message: "Error : User ID cannot be Empty !"
            })
        }

        if (!start) {
            return res.send({
                success: false,
                message: "Error : Start Station cannot be Empty !"
            })
        }
        if (!end) {
            return res.send({
                success: false,
                message: "Error : End Station cannot be Empty !"
            })
        }
        if (!date) {
            return res.send({
                success: false,
                message: "Error : Date cannot be Empty !"
            })
        }
        if (!qty) {
            return res.send({
                success: false,
                message: "Error : Qty cannot be Empty !"
            })
        }
        if (!total) {
            return res.send({
                success: false,
                message: "Error : Total cannot be Empty !"
            })
        }

        const booking = new Bookings();
        booking.userID = userID;
        booking.start = start;
        booking.end = end;
        booking.qty = qty;
        booking.date = new Date(date);
        booking.total = total;

        booking.save((err, bookingData) => {
            if (err) {
                return res.send({
                    success: false,
                    message: "Error : Server Error !"
                })
            }
            return res.send({
                success: true,
                message: "Train Ticket Reservation Successful !",
                details: bookingData
            })
        });


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

    //IT17009096
    //Wellala S. S

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