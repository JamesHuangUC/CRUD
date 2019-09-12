const Sequelize = require('sequelize');
const db = require('../config/database.js');
const Product = require('./Product.js');

const User = db.define('users', {
    name: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    }
});

User.hasMany(Product, { foreignKey: { name: 'userId', allowNull: false } });

db
    .sync({ force: true })
    .then(() => {
        console.log(`Database and tables created.`);
    })
    .catch(err => console.log(err));

module.exports = User;
