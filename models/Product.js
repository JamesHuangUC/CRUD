const Sequelize = require('sequelize');
const db = require('../config/database.js');
const User = require('./User.js');

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
    // userId: {
    //     type: Sequelize.INTEGER,
    //     allowNull: false,
    //     references: {
    //         model: 'users',
    //         key: 'id'
    //     }
    // }
});

// Product.associate = function(models) {
//     Product.belongsTo(models.User, { foreignKey: { name: 'userId', allowNull: false } });
// }

// db.sync({ force: true }).then(() => {
//     console.log(`Database and tables created.`);
// });

module.exports = Product;
