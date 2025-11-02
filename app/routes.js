 /*
I used chatGPT.com to figure out the answer, then read some sources to understand why chatgpt came to the conclusion my code 
was built for a MongoClient rather than mongoose! So i read documentation to use a schema and implement the schema in the code 


https://mongoosejs.com/docs/models.html


*/

const mongoose = require('mongoose');

// Define a simple Message schema
const messageSchema = new mongoose.Schema({
  name: String,
  msg: String,
  thumbUp: { type: Number, default: 0 },
  thumbDown: { type: Number, default: 0 }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = function(app, passport) {

  // normal routes ===============================================================
  // show the home page (will also have our login links)
  app.get('/', function(req, res) {
    res.render('index.ejs');
  });

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, async function(req, res) {
    try {
      const messages = await Message.find().lean();
      res.render('profile.ejs', {
        user: req.user,
        messages: messages
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error loading messages');
    }
  });

  // LOGOUT ==============================
  app.get('/logout', function(req, res) {
    req.logout(() => {
      console.log('User has logged out!');
    });
    res.redirect('/');
  });

  // message board routes ===============================================================

  app.post('/messages', async (req, res) => {
    try {
      const newMessage = new Message({
        name: req.body.name,
        msg: req.body.msg,
        thumbUp: 0,
        thumbDown: 0
      });
      await newMessage.save();
      console.log('saved to database');
      res.redirect('/profile');
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to save message');
    }
  });

  app.put('/messages', async (req, res) => {
    try {
      const result = await Message.findOneAndUpdate(
        { name: req.body.name, msg: req.body.msg },
        { $inc: { thumbUp: 1 } },
        { new: true, upsert: true }
      );
      res.send(result);
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  });

  app.delete('/messages', async (req, res) => {
    try {
      await Message.findOneAndDelete({ name: req.body.name, msg: req.body.msg });
      res.send('Message deleted!');
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  });

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // LOGIN ===============================
  app.get('/login', function(req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }));

  // SIGNUP ===============================
  app.get('/signup', function(req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  app.get('/unlink/local', isLoggedIn, function(req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
