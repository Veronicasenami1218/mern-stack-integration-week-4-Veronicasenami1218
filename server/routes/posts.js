const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// GET /api/posts  - list with pagination and optional category
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.category) {
      const cat = req.query.category;
      // support both id and slug lookup for category filter
      if (mongoose.Types.ObjectId.isValid(cat)) {
        filter.category = cat;
      }
    }

    const [items, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'name email')
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/search?q=
router.get('/search', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ success: true, data: [] });
    const regex = new RegExp(q, 'i');
    const results = await Post.find({ $or: [{ title: regex }, { content: regex }] })
      .select('title slug excerpt featuredImage createdAt');
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/:idOrSlug
router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const query = mongoose.Types.ObjectId.isValid(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    const post = await Post.findOne(query)
      .populate('author', 'name email')
      .populate('category', 'name slug');

    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    await post.incrementViewCount();

    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts
router.post(
  '/',
  protect,
  [
    body('title').isString().trim().isLength({ min: 3 }),
    body('content').isString().isLength({ min: 1 }),
    body('category').isString().custom((v) => mongoose.Types.ObjectId.isValid(v)),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { title, content, featuredImage, excerpt, category, tags } = req.body;
      const post = await Post.create({
        title,
        content,
        featuredImage,
        excerpt,
        category,
        tags,
        author: req.user.id,
        isPublished: true,
      });
      res.status(201).json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/posts/:id
router.put(
  '/:id',
  protect,
  [
    body('title').optional().isString().trim().isLength({ min: 3 }),
    body('content').optional().isString().isLength({ min: 1 }),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const post = await Post.findByIdAndUpdate(id, updates, { new: true });
      if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
      res.json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/posts/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    res.json({ success: true, data: { id } });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:id/comments
router.post(
  '/:id/comments',
  protect,
  [body('content').isString().isLength({ min: 1 })],
  handleValidation,
  async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
      await post.addComment(req.user.id, req.body.content);
      res.status(201).json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
