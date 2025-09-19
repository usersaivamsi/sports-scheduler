const express = require('express');
const router = express.Router();
const Sport = require('../models/Sport');
const { isAuth, isAdmin } = require('../middleware/auth');

// list all sports (visible to all)
router.get('/', async (req, res) => {
  const sports = await Sport.find();
  res.render('sports_list', { sports });
});

// create form (admin)
router.get('/new', isAuth, isAdmin, (req, res) => res.render('create_sport'));

// create
router.post('/', isAuth, isAdmin, async (req, res) => {
  const { name, description } = req.body;
  await new Sport({ name, description, createdBy: req.session.user.id }).save();
  res.redirect('/sports');
});

// edit form
router.get('/:id/edit', isAuth, isAdmin, async (req, res) => {
  const sport = await Sport.findById(req.params.id);
  res.render('edit_sport', { sport });
});

// update
router.put('/:id', isAuth, isAdmin, async (req, res) => {
  await Sport.findByIdAndUpdate(req.params.id, { name: req.body.name, description: req.body.description });
  res.redirect('/sports');
});

// delete
router.delete('/:id', isAuth, isAdmin, async (req, res) => {
  await Sport.findByIdAndDelete(req.params.id);
  res.redirect('/sports');
});

module.exports = router;
