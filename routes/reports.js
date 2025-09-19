const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { isAuth, isAdmin } = require('../middleware/auth');

router.get('/', isAuth, isAdmin, async (req, res) => {
  const { from, to } = req.query;
  const start = from ? new Date(from) : new Date(0);
  const end = to ? new Date(to) : new Date();
  // sessions in range, exclude cancelled
  const sessions = await Session.find({
    dateTime: { $gte: start, $lte: end },
    status: { $ne: 'cancelled' }
  }).populate('sport');

  const totalSessions = sessions.length;
  const popMap = {}; // sportName -> total players
  sessions.forEach(s => {
    const sportName = s.sport ? s.sport.name : 'Unknown';
    popMap[sportName] = (popMap[sportName] || 0) + s.players.length;
  });

  res.render('reports', { totalSessions, popMap, from, to });
});

module.exports = router;
