const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token invalid' });
  }
};

module.exports = { protect };
