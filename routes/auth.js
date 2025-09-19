const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// signup page
router.get('/signup', (req, res) => res.render('signup'));

// handle signup
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const exist = await User.findOne({ email });
    if (exist) return res.send('User already exists. <a href="/signup">Back</a>');
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role: role || 'player' });
    await user.save();
    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    res.redirect('/');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// login page
router.get('/login', (req, res) => res.render('login'));

// handle login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.send('Invalid credentials. <a href="/login">Back</a>');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.send('Invalid credentials. <a href="/login">Back</a>');
    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    res.redirect('/');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
