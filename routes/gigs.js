const express = require('express');
const faker = require('faker');
const router = express.Router();
const db = require('../config/database.js');
const Gig = require('../models/Gig.js');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

function validateForm(data) {
    let {
        title,
        technologies,
        budget,
        description,
        contact_email,
        cover
    } = data;
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
    return errors;
}

// Generate random data to database
router.get('/generate', function(req, res, next) {
    for (var i = 0; i < 10; i++) {
        Gig.create({
            title: faker.commerce.productName(),
            technologies: faker.commerce.department(),
            budget: `$${faker.commerce.price()}`,
            description: faker.lorem.sentences(),
            contact_email: faker.internet.email(),
            cover: faker.image.image()
        }).catch(err => console.log(err));
    }
    res.redirect('/gigs/pages/1');
});

// Display pages of gig
router.get('/pages/:page', (req, res) => {
    const perPage = 12;
    let page = req.params.page || 1;
    let offset = (page - 1) * perPage;
    let limit = perPage;
    return Gig.findAndCountAll({
        offset,
        limit
    })
        .then(result => {
            res.render('gigs', {
                gigs: result.rows,
                current: page,
                pages: Math.ceil(result.count / perPage)
            });
        })
        .catch(err => console.log(err));
});

// Display edit gig form
router.get('/:id/edit', (req, res) => {
    const { id } = req.params;
    Gig.findByPk(id).then(gig => {
        res.render('edit', {
            gig
        });
    });
});

// Display search result
router.get('/search', (req, res) => {
    let { term } = req.query;
    term = term.toLowerCase();
    Gig.findAll({ where: { technologies: { [Op.like]: '%' + term + '%' } } })
        .then(gigs => res.render('gigs', { gigs }))
        .catch(err => console.log(err));
});

// Display add gig form
router.get('/add', (req, res) => res.render('add'));

// Create single gig
router.post('/add', (req, res) => {
    let {
        title,
        technologies,
        budget,
        description,
        contact_email,
        cover
    } = req.body;
    let errors = validateForm(req.body);

    if (errors.length > 0) {
        res.render('add', {
            errors,
            title,
            technologies,
            budget,
            description,
            contact_email,
            cover
        });
    } else {
        budget = !budget ? 'Unknown' : `$${budget}`;
        technologies = technologies.toLowerCase().replace(/, /g, ',');

        Gig.create({
            title,
            technologies,
            budget,
            description,
            contact_email,
            cover
        })
            .then(gig => res.redirect('/gigs'))
            .catch(err => console.log(err));
    }
});

// Read single gigs
router.get('/:id', (req, res) => {
    const { id } = req.params;
    Gig.findByPk(id).then(gig => {
        res.render('gig', {
            gig
        });
    });
});

// Update single gig
router.put('/:id', (req, res) => {
    const { id } = req.params;
    let {
        title,
        technologies,
        budget,
        description,
        contact_email,
        cover
    } = req.body;
    let errors = validateForm(req.body);

    if (errors.length > 0) {
        res.render('edit', {
            gig: {
                errors,
                id,
                title,
                technologies,
                budget,
                description,
                contact_email,
                cover
            }
        });
    } else {
        budget = !budget ? 'Unknown' : `$${budget}`;
        technologies = technologies.toLowerCase().replace(/, /g, ',');

        Gig.update(
            {
                title,
                description,
                budget,
                contact_email,
                technologies,
                cover
            },
            {
                where: { id }
            }
        )
            .then(res.redirect('/gigs'))
            .catch(err => console.log(err));
    }
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

// Redirect /gigs to /gigs/pages/1
router.get('/', (req, res) => res.redirect('/gigs/pages/1'));

module.exports = router;
