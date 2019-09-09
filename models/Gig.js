const Sequelize = require('sequelize');
const db = require('../config/database.js');

const Gig = db.define('gig', {
    product_name: {
        type: Sequelize.STRING
    },
    category: {
        type: Sequelize.STRING
    },
    description: {
        type: Sequelize.STRING
    },
    price: {
        type: Sequelize.STRING
    },
    contact_email: {
        type: Sequelize.STRING
    },
    cover: {
        type: Sequelize.STRING
    }
});

module.exports = Gig;
