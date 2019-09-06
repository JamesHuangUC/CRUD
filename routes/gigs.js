const express = require('express');
const router = express.Router();
const db = require('../config/database.js');
const Gig = require('../models/Gig.js');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Read gig
router.get('/', (req, res) =>
    Gig.findAll()
        .then(gigs => {
            res.render('gigs', {
                gigs
            });
        })
        .catch(err => console.log(err))
);

// Display add gig form
router.get('/add', (req, res) => res.render('add'));

// Add gig
router.post('/add', (req, res) => {
    // const data = {
    //     title: 'Simple Wordpress website',
    //     technologies: 'wordpress,php,html,css',
    //     budget: '$1000',
    //     description:
    //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec efficitur nisl eu magna bibendum, nec volutpat diam facilisis. Integer vehicula auctor purus at vehicula. Integer quis sodales nisl. Nunc ut diam vitae justo auctor pellentesque.',
    //     contact_email: 'user2@gmail.com'
    // };

    // let { title, technologies, budget, description, contact_email } = data;
    let { title, technologies, budget, description, contact_email } = req.body;

    // Validate
    let errors = [];
    if (!title) {
        errors.push({ text: 'Please add a title' });
    }
    if (!technologies) {
        errors.push({ text: 'Please add some technologies' });
    }
    if (!description) {
        errors.push({ text: 'Please add a description' });
    }
    if (!contact_email) {
        errors.push({ text: 'Please add a contact email' });
    }

    if (errors.length > 0) {
        res.render('add', {
            errors,
            title,
            technologies,
            budget,
            description,
            contact_email
        });
    } else {
        if (!budget) {
            budget = 'Unknown';
        } else {
            budget = `$${budget}`;
        }

        // Make lowercase and remove comma and space
        technologies = technologies.toLowerCase().replace(/, /g, ',');

        Gig.create({
            title,
            technologies,
            budget,
            description,
            contact_email
        })
            .then(gig => res.redirect('/gigs'))
            .catch(err => console.log(err));
    }
});

// Search for gigs
router.get('/search', (req, res) => {
    let { term } = req.query;
    term = term.toLowerCase();
    Gig.findAll({ where: { technologies: { [Op.like]: '%' + term + '%' } } })
        .then(gigs => res.render('gigs', { gigs }))
        .catch(err => console.log(err));
});

module.exports = router;
