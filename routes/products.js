const express = require('express');
const faker = require('faker');
const router = express.Router();
const db = require('../config/database.js');
const Product = require('../models/Product.js');
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
        Product.create({
            product_name: faker.commerce.productName(),
            category: faker.commerce.department().toLowerCase(),
            price: `$${faker.commerce.price()}`,
            description: faker.lorem.sentences(),
            contact_email: faker.internet.email(),
            cover: faker.image.image()
        }).catch(err => console.log(err));
    }
    res.redirect('/products/pages/1');
});

// Remove all data
router.get('/clean', function(req, res, next) {
    Product.destroy({
        where: {},
        truncate: true /* this will ignore where and truncate the table instead */
    })
        .then(res.redirect('/products/pages/1'))
        .catch(err => console.log(err));
});

// Display pages of product
router.get('/pages/:page', (req, res) => {
    const perPage = 12;
    let page = req.params.page || 1;
    let offset = (page - 1) * perPage;
    let limit = perPage;
    return Product.findAndCountAll({
        offset,
        limit
    })
        .then(result => {
            res.render('products', {
                products: result.rows,
                current: page,
                pages: Math.ceil(result.count / perPage)
            });
        })
        .catch(err => console.log(err));
});

// Display edit product form
router.get('/:id/edit', (req, res) => {
    const { id } = req.params;
    Product.findByPk(id).then(product => {
        res.render('edit', {
            product
        });
    });
});

// Display search result
router.get('/search', (req, res) => {
    let { term } = req.query;
    term = term.toLowerCase();
    Product.findAll({ where: { category: { [Op.like]: '%' + term + '%' } } })
        .then(products => res.render('products', { products }))
        .catch(err => console.log(err));
});

// Display add product form
router.get('/add', (req, res) => res.render('add'));

// Create single product
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

        Product.create({
            product_name,
            category,
            price,
            description,
            contact_email,
            cover
        })
            .then(product => res.redirect('/products'))
            .catch(err => console.log(err));
    }
});

// Read single products
router.get('/:id', (req, res) => {
    const { id } = req.params;
    Product.findByPk(id).then(product => {
        res.render('product', {
            product
        });
    });
});

// Update single product
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
            product: {
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

        Product.update(
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
            .then(res.redirect('/products'))
            .catch(err => console.log(err));
    }
});

// Delete single products
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    Product.destroy({
        where: { id }
    })
        .then(res.redirect('/products'))
        .catch(err => console.log(err));
});

// Redirect /products to /products/pages/1
router.get('/', (req, res) => res.redirect('/products/pages/1'));

module.exports = router;
