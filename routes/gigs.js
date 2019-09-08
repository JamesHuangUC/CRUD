const express = require('express');
const router = express.Router();
const db = require('../config/database.js');
const Gig = require('../models/Gig.js');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Read all gigs
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

// Read single gigs
router.get('/:id', (req, res) => {
    console.log(req.params);
    const { id } = req.params;
    Gig.findByPk(id).then(gig => {
        res.render('gig', {
            gig
        });
    });
});

// Delete single gigs
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    Gig.destroy({
        where: { id }
    })
        .then(res.redirect('/gigs'))
        .catch(err => console.log(err));
});

// Edit single gigs
router.get('/:id/edit', (req, res) => {
    const { id } = req.params;
    Gig.findByPk(id).then(gig => {
        console.log(gig);
        res.render('edit', {
            gig
        });
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;

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
        console.log(errors);
        res.render('edit', {
            gig: {
                errors,
                id,
                title,
                technologies,
                budget,
                description,
                contact_email
            }
        });
    } else {
        if (!budget) {
            budget = 'Unknown';
        } else {
            budget = `$${budget}`;
        }

        // Make lowercase and remove comma and space
        technologies = technologies.toLowerCase().replace(/, /g, ',');

        Gig.update(
            {
                title,
                description,
                budget,
                contact_email,
                technologies
            },
            {
                where: { id }
            }
        )
            .then(res.redirect('/gigs'))
            .catch(err => console.log(err));
    }
});

module.exports = router;
