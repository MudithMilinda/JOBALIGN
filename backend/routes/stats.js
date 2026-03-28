// routes/stats.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // your existing User model

// GET /api/stats/user-count
router.get('/user-count', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;