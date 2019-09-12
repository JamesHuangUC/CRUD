const express = require('express');
const faker = require('faker');
const router = express.Router();
const db = require('../config/database.js');
const Product = require('../models/Product.js');
const User = require('../models/User.js');
const Sequelize = require('sequelize');

const { ensureAuthenticated } = require('../config/auth');

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

// router.use(ensureAuthenticated);

// Dashboard
router.get('/dashboard', ensureAuthenticated, function(req, res, next) {
    User.findByPk(req.user.id, { include: ['products'] })
        .then(user => {
            res.render('products', {
                products: user.get().products,
                user: req.user
            });
        })
        .catch(err => {
            console.log(err);
        });
});

// Generate random data to database
router.get('/generate', ensureAuthenticated, function(req, res, next) {
    for (let i = 0; i < 10; i++) {
        Product.create({
            product_name: faker.commerce.productName(),
            category: faker.commerce.department().toLowerCase(),
            price: `$${faker.commerce.price()}`,
            description: faker.lorem.sentences(),
            contact_email: faker.internet.email(),
            cover: faker.image.image(),
            userId: req.user.id
        }).catch(err => console.log(err));
    }
    res.redirect('/products/pages/1');
});

// Remove all data
router.get('/clean', ensureAuthenticated, function(req, res, next) {
    Product.destroy({
        where: {
            userId: req.user.id
        }
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
                pages: Math.ceil(result.count / perPage),
                user: req.user
            });
        })
        .catch(err => console.log(err));
});

// Display edit product form
router.get('/:id/edit', ensureAuthenticated, (req, res) => {
    const { id } = req.params;
    Product.findByPk(id).then(product => {
        res.render('edit', {
            product,
            user: req.user
        });
    });
});

// Display search result
router.get('/search', (req, res) => {
    let { term } = req.query;
    term = term.toLowerCase();
    Product.findAll({ where: { category: { [Op.like]: '%' + term + '%' } } })
        .then(products => res.render('products', { products, user: req.user }))
        .catch(err => console.log(err));
});

// Display add product form
router.get('/add', ensureAuthenticated, (req, res) =>
    res.render('add', { user: req.user })
);

// Create single product
router.post('/add', ensureAuthenticated, (req, res) => {
    let userId = req.user.id;
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
            cover,
            userId
        })
            .then(product => res.redirect('/products'))
            .catch(err => console.log(err));
    }
});

// Read single products
router.get('/:id', (req, res) => {
    const { id } = req.params;

    User.findOne({
        where: {},
        include: [{ model: Product, where: { id: id } }]
    })
        .then(user => {
            res.render('product', {
                product: user.products[0],
                productUser: user,
                user: req.user
            });
        })
        .catch(err => {
            console.log(err);
        });
});

// Update single product
router.put('/:id', ensureAuthenticated, (req, res) => {
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
router.delete('/:id', ensureAuthenticated, (req, res) => {
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
