const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const router = express.Router();

// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) =>
    res.render('login', { layout: 'user' })
);

// Register Page
router.get('/register', forwardAuthenticated, (req, res) =>
    res.render('register', { layout: 'user' })
);

// Register
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields.' });
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match.' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters.' });
    }

    if (errors.length > 0) {
        // if there is errors fill out the register form
        res.render('register', {
            layout: 'user',
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        User.findOne({ where: { email: email } }).then(user => {
            if (user) {
                // if the registered email is already in the database
                errors.push({ msg: 'Email is already exists.' });
                res.render('register', {
                    layout: 'user',
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                // create a new user
                const newUser = new User({
                    name,
                    email,
                    password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => {
                                req.flash(
                                    'success_msg',
                                    'You are now registered and can log in.'
                                );
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                    });
                });
            }
        });
    }
});

// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/products/pages/1',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out.');
    res.redirect('/users/login');
});

module.exports = router;
