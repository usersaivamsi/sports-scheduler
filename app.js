require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, useUnifiedTopology: true
})
  .then(()=> console.log('MongoDB connected'))
  .catch(err => console.error('Mongo connect error:', err));

// view engine & static
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));

// body parser
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// make user available in views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// routes
const authRoutes = require('./routes/auth');
const sportRoutes = require('./routes/sports');
const sessionRoutes = require('./routes/sessions');
const reportRoutes = require('./routes/reports');

app.use('/', authRoutes);
app.use('/sports', sportRoutes);
app.use('/sessions', sessionRoutes);
app.use('/reports', reportRoutes);

app.get('/', (req, res) => res.redirect('/sessions'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
