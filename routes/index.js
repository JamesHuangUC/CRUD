const express = require('express');
const router = express.Router();
const { forwardAuthenticated } = require('../config/auth');
const Product = require('../models/Product.js');

// Home page
router.get('/', forwardAuthenticated, (req, res) => {
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

module.exports = router;
