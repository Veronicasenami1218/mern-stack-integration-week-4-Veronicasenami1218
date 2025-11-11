const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    const items = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

// POST /api/categories
router.post(
  '/',
  protect,
  [body('name').isString().trim().isLength({ min: 2 })],
  handleValidation,
  async (req, res, next) => {
    try {
      const exists = await Category.findOne({ name: req.body.name.trim() });
      if (exists) {
        return res.status(400).json({ success: false, error: 'Category already exists' });
      }
      const cat = await Category.create({ name: req.body.name.trim() });
      res.status(201).json({ success: true, data: cat });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
