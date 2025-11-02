// config/passport.js

// load all the things we need
const LocalStrategy = require('passport-local').Strategy;

// load up the user model
const User = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function (passport) {

  // =========================================================================
  // PASSPORT SESSION SETUP ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  passport.use('local-signup', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    async (req, email, password, done) => {
      try {
        // find a user whose email is the same as the form’s email
        const existingUser = await User.findOne({ 'local.email': email });

        // if the user already exists, show a flash message
        if (existingUser) {
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        }

        // if there is no user with that email, create the user
        const newUser = new User();
        newUser.local.email = email;
        newUser.local.password = newUser.generateHash(password); // use the generateHash function in our user model

        // save the user
        await newUser.save();

        return done(null, newUser);

      } catch (err) {
        return done(err);
      }
    }
  ));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  passport.use('local-login', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    async (req, email, password, done) => {
      try {
        // find a user whose email is the same as the form’s email
        const user = await User.findOne({ 'local.email': email });

        // if no user is found, return the message
        if (!user) {
          return done(null, false, req.flash('loginMessage', 'No user found.'));
        }

        // if the user is found but the password is wrong
        if (!user.validPassword(password)) {
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
        }

        // all is well, return successful user
        return done(null, user);

      } catch (err) {
        return done(err);
      }
    }
  ));
};
