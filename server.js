// server.js

// ===== IMPORTS =====
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

const configDB = require('./config/database.js'); // should export { url: 'mongodb://...' }

const app = express();
const port = process.env.PORT || 8080;

// ===== MONGOOSE CONNECT =====
mongoose.connect(configDB.url)
  .then(() => {
    console.log('✅ Connected to MongoDB via Mongoose');

    // Passport config
    require('./config/passport')(passport);

    // Routes (pass only app and passport)
    require('./app/routes.js')(app, passport);

    // Start server AFTER DB connects
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ===== MIDDLEWARE =====
app.use(morgan('dev')); // logging
app.use(cookieParser()); // read cookies
app.use(bodyParser.json()); // parse JSON
app.use(bodyParser.urlencoded({ extended: true })); // parse URL-encoded

// Serve static files correctly (fix MIME type issues)
app.use(express.static(path.join(__dirname, 'public'))); // public/ folder

// EJS view engine
app.set('view engine', 'ejs');

// Passport session & flash messages
app.use(session({
  secret: 'rcbootcamp2021b',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
