const Sequelize = require('sequelize');
const db = require('../config/database.js');

const Product = db.define('products', {
    product_name: {
        type: Sequelize.STRING
    },
    category: {
        type: Sequelize.STRING
    },
    description: {
        type: Sequelize.TEXT
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

// db.sync({ force: true }).then(() => {
//     console.log(`Database and tables created.`);
// });

module.exports = Product;
