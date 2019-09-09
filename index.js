const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');

// Connect db
const db = require('./config/database.js');

// Test db
db
    .authenticate()
    .then(() => console.log('DB connected'))
    .catch(err => console.log('Error: ' + err));

// Start server
const app = express();
const PORT = process.env.PORT || 3000;

// Handlebars
const hbs = exphbs.create({
    defaultLayout: 'main',
    helpers: {
        ifequal: function(v1, v2, options) {
            if (v1 == v2) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        },
        pagebar: function(current, pages, options) {
            current = Number(current);
            pages = Number(pages);
            let out = '';
            let i = current > 5 ? current - 4 : 1;
            if (i !== 1) {
                out += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
            }
            for (; i <= current + 4 && i <= pages; i++) {
                if (i == current) {
                    out += `<li class="page-item active"><a class="page-link">${i}</a></li>`;
                } else {
                    out += `<li class="page-item"><a class="page-link" href="/products/pages/${i}">${i}</a></li>`;
                }
                if (i == current + 4 && i < pages) {
                    out += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
                }
            }
            return out;
        }
    }
});
app.engine('handlebars', exphbs(hbs));
app.set('view engine', 'handlebars');

// body parser
app.use(bodyParser.urlencoded({ extended: false }));

// Method override
app.use(methodOverride('_method'));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Landing page
app.get('/', (req, res) => res.render('/products/pages/1', { layout: 'main' }));

// Product routes
app.use('/products', require('./routes/products.js'));

app.listen(PORT, console.log(`App is listening on ${PORT}`));
