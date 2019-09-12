const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

const PORT = process.env.PORT || 3000;

// Connect db
const db = require('./config/database.js');

// // Passport Config
require('./config/passport')(passport);

// Test db
db
    .authenticate()
    .then(() => console.log('DB connected'))
    .catch(err => console.log('Error: ' + err));

// Create server
const app = express();

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

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

// // body parser
// app.use(bodyParser.urlencoded({ extended: false }));

// Method override
app.use(methodOverride('_method'));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Landing page
// app.get('/', (req, res) => res.render('products', { layout: 'main' }));

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));

// Product routes
app.use('/products', require('./routes/products.js'));

app.listen(PORT, console.log(`App is listening on ${PORT}`));
