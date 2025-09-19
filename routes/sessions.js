const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Sport = require('../models/Sport');
const { isAuth } = require('../middleware/auth');

// list available sessions (active)
router.get('/', async (req, res) => {
  const sessions = await Session.find({ status: 'active' }).populate('sport').populate('createdBy');
  res.render('sessions_list', { sessions });
});

// create session form
router.get('/new', isAuth, async (req, res) => {
  const sports = await Sport.find();
  res.render('create_session', { sports });
});

// create session
router.post('/', isAuth, async (req, res) => {
  const { sportId, initialPlayerNames, requiredPlayers, date, time, venue } = req.body;
  const players = [];
  if (initialPlayerNames) {
    initialPlayerNames.split(',').map(s => s.trim()).filter(Boolean).forEach(n => players.push({ name: n }));
  }
  // add creator as first player (if not already in list)
  if (!players.some(p => p.name === req.session.user.name)) {
    players.unshift({ userId: req.session.user.id, name: req.session.user.name });
  }
  const dateTime = new Date(`${date}T${time}`);
  await new Session({
    sport: sportId,
    createdBy: req.session.user.id,
    players,
    requiredPlayers: parseInt(requiredPlayers || 0),
    dateTime,
    venue
  }).save();
  res.redirect('/sessions/my');
});

// my created sessions
router.get('/my', isAuth, async (req, res) => {
  const mySessions = await Session.find({ createdBy: req.session.user.id }).populate('sport');
  res.render('my_sessions', { mySessions });
});

// sessions the user joined
router.get('/joined', isAuth, async (req, res) => {
  const joined = await Session.find({ 'players.userId': req.session.user.id }).populate('sport');
  res.render('joined_sessions', { joined });
});

// view session detail
router.get('/:id', isAuth, async (req, res) => {
  const sess = await Session.findById(req.params.id).populate('sport').populate('createdBy').populate('players.userId');
  res.render('session_detail', { sess });
});

// join session
router.post('/:id/join', isAuth, async (req, res) => {
  const sess = await Session.findById(req.params.id);
  if (!sess) return res.status(404).send('Not found');
  if (sess.status !== 'active') return res.send('Cannot join this session');
  if (sess.dateTime < new Date()) return res.send('Cannot join past session');

  // already joined?
  if (sess.players.some(p => p.userId && p.userId.toString() === req.session.user.id)) {
    return res.send('Already joined.');
  }

  // check capacity (if requiredPlayers set)
  if (sess.requiredPlayers && sess.players.length >= sess.requiredPlayers) {
    return res.send('No slots available.');
  }

  sess.players.push({ userId: req.session.user.id, name: req.session.user.name });
  await sess.save();
  res.redirect('/sessions/' + req.params.id);
});

// cancel session (only creator or admin)
router.put('/:id/cancel', isAuth, async (req, res) => {
  const sess = await Session.findById(req.params.id);
  if (!sess) return res.status(404).send('Not found');
  if (sess.createdBy.toString() !== req.session.user.id && req.session.user.role !== 'admin') {
    return res.status(403).send('Forbidden');
  }
  sess.status = 'cancelled';
  sess.cancellationReason = req.body.reason || 'No reason provided';
  await sess.save();
  res.redirect('/sessions/my');
});

module.exports = router;
