// app/routes.js
const Post = require('./models/post.js');

module.exports = function(app, passport, upload) {

  // ===== ROOT =====
  app.get('/', (req, res) => {
    if (req.user) {
      res.redirect('/feed');
    } else {
      res.render('index');
    }
  });

  // ===== LOGIN =====
  app.get('/login', (req, res) => {
    res.render('login', { message: req.flash('loginMessage') });
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/feed',
    failureRedirect: '/login',
    failureFlash: true
  }));

  // ===== SIGNUP =====
  app.get('/signup', (req, res) => {
    res.render('signup', { message: req.flash('signupMessage') });
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/feed',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  // ===== LOGOUT =====
  app.get('/logout', (req, res, next) => {
    req.logout(function(err) {
      if (err) return next(err);
      res.redirect('/');
    });
  });

  // ===== FEED =====
  app.get('/feed', (req, res) => {
    if (!req.user) return res.redirect('/login');

    Post.find().sort({ createdAt: -1 }).lean()
      .then(posts => {
        res.render('feed', { user: req.user, posts });
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error loading feed');
      });
  });

  // ===== PROFILE =====
  app.get('/profile', (req, res) => {
    if (!req.user) return res.redirect('/login');

    Post.find({ user: req.user.local.email }).sort({ createdAt: -1 }).lean()
      .then(posts => {
        res.render('profile', { user: req.user, posts });
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error loading profile');
      });
  });

  // post route 
  app.post('/post', upload.single('image'), (req, res) => {
    if (!req.user) return res.redirect('/login')

    const newPost = new Post({
      user: req.user.local.email,
      avatar: req.user.avatar || '/img/default-avatar.png',
      content: req.body.content,
      imageUrl: req.body.imageUrl || (req.file ? `/uploads/${req.file.filename}` : '')
    });

    // save post then redirect to the live feed
    newPost.save()
      .then(() => res.redirect('/feed'))
      .catch(err => {
        console.error(err);
        res.status(500).send('Failed to create post');
      });
  });

  // ===== LIKE =====
  app.put('/post/like', (req, res) => {
    if (!req.user) return res.status(401).send('Unauthorized');

    Post.findByIdAndUpdate(req.body.id, { $inc: { likes: 1 } }, { new: true })
      .then(post => res.send(post))
      .catch(err => res.status(500).send(err));
  });

  // ===== DISLIKE =====
  app.put('/post/dislike', (req, res) => {
    if (!req.user) return res.status(401).send('Unauthorized');

    Post.findByIdAndUpdate(req.body.id, { $inc: { dislikes: 1 } }, { new: true })
      .then(post => res.send(post))
      .catch(err => res.status(500).send(err));
  });

  // ===== DELETE POST (DELETE method) =====
  app.delete('/post', (req, res) => {
    if (!req.user) return res.status(401).send('Unauthorized');

    Post.findOneAndDelete({ _id: req.body.id, user: req.user.local.email })
      .then(() => res.send('Post deleted!'))
      .catch(err => res.status(500).send(err));
  });

  // ===== DELETE POST (POST method for form compatibility) =====
  app.post('/post/delete/:id', async (req, res) => {
    try {
      if (!req.user) return res.redirect('/login');
      
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).send('Post not found');
      }

      if (post.user !== req.user.local.email) {
        return res.status(403).send('You can only delete your own posts!');
      }

      await Post.findByIdAndDelete(req.params.id);
      res.redirect('/feed');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error deleting post');
    }
  });

};