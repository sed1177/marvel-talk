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
const multer = require('multer');
const path = require('path');

const configDB = require('./config/database.js');

const app = express();
const port = process.env.PORT || 8080;

// using multer for uploading files (looking for an alternative)
const upload = multer({ dest: 'public/uploads/' });

// ===== MIDDLEWARE =====
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'rcbootcamp2021b',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// ===== MONGOOSE CONNECT =====
mongoose.connect(configDB.url)
  .then(() => {
    console.log('✅ Connected to MongoDB via Mongoose');

    // ===== PASSPORT CONFIG =====
    require('./config/passport')(passport);

    // ===== ROUTES =====
    require('./app/routes.js')(app, passport, upload);

    // ===== START SERVER =====
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));