require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: 'lax',
  },
}));

app.use(express.static(path.join(__dirname, 'public')));

// Auth endpoints (unprotected)
app.post('/api/auth/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });

  const valid = await bcrypt.compare(password, process.env.PASSWORD_HASH);
  if (!valid) return res.status(401).json({ error: 'Incorrect password' });

  req.session.authenticated = true;
  res.json({ authenticated: true });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ authenticated: false });
  });
});

app.get('/api/auth/status', (req, res) => {
  res.json({ authenticated: !!req.session.authenticated });
});

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.authenticated) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

// API routes (protected)
app.use('/api/categories', requireAuth, require('./routes/categories'));
app.use('/api/businesses', requireAuth, require('./routes/businesses'));
app.use('/api/payment-methods', requireAuth, require('./routes/paymentMethods'));
app.use('/api/expenses', requireAuth, require('./routes/expenses'));
app.use('/api/recurring', requireAuth, require('./routes/recurring'));
app.use('/api/summary', requireAuth, require('./routes/summary'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MoneyMap running at http://localhost:${PORT}`);
});
