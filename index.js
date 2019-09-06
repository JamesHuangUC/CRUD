const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');

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
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// body parser
app.use(bodyParser.urlencoded({ extended: false }));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Landing page
app.get('/', (req, res) => res.render('index', { layout: 'landing' }));

// Gig routes
app.use('/gigs', require('./routes/gigs.js'));

app.listen(PORT, console.log(`App is listening on ${PORT}`));
