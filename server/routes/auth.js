const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const signToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').isString().trim().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 6 }),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ success: false, error: 'Email already in use' });
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const user = await User.create({ name, email, password: hash });
      const token = signToken(user);
      res.status(201).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').isString().isLength({ min: 6 })],
  handleValidation,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ success: false, error: 'Invalid credentials' });
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(400).json({ success: false, error: 'Invalid credentials' });
      const token = signToken(user);
      res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
