const express = require('express');
const faker = require('faker');
const router = express.Router();
const db = require('../config/database.js');
const Gig = require('../models/Gig.js');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

function validateForm(data) {
    let {
        product_name,
        category,
        price,
        description,
        contact_email,
        cover
    } = data;
    let errors = [];
    if (!product_name) {
        errors.push({ text: 'Please add a product name' });
    }
    if (!category) {
        errors.push({ text: 'Please add some category' });
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
    for (let i = 0; i < 10; i++) {
        Gig.create({
            product_name: faker.commerce.productName(),
            category: faker.commerce.department().toLowerCase(),
            price: `$${faker.commerce.price()}`,
            description: faker.lorem.sentences(),
            contact_email: faker.internet.email(),
            cover: faker.image.image()
        }).catch(err => console.log(err));
    }
    res.redirect('/gigs/pages/1');
});

// Remove all data
router.get('/clean', function(req, res, next) {
    Gig.destroy({
        where: {},
        truncate: true /* this will ignore where and truncate the table instead */
    })
        .then(res.redirect('/gigs/pages/1'))
        .catch(err => console.log(err));
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
    Gig.findAll({ where: { category: { [Op.like]: '%' + term + '%' } } })
        .then(gigs => res.render('gigs', { gigs }))
        .catch(err => console.log(err));
});

// Display add gig form
router.get('/add', (req, res) => res.render('add'));

// Create single gig
router.post('/add', (req, res) => {
    let {
        product_name,
        category,
        price,
        description,
        contact_email,
        cover
    } = req.body;
    let errors = validateForm(req.body);

    if (errors.length > 0) {
        res.render('add', {
            errors,
            product_name,
            category,
            price,
            description,
            contact_email,
            cover
        });
    } else {
        price = !price ? 'Unknown' : `$${price}`;
        category = category.toLowerCase().replace(/, /g, ',');

        Gig.create({
            product_name,
            category,
            price,
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
        product_name,
        category,
        price,
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
                product_name,
                category,
                price,
                description,
                contact_email,
                cover
            }
        });
    } else {
        price = !price ? 'Unknown' : `$${price}`;
        category = category.toLowerCase().replace(/, /g, ',');

        Gig.update(
            {
                product_name,
                description,
                price,
                contact_email,
                category,
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
