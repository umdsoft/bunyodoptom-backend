const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, uid, is_admin, phone, name }
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user?.is_admin) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
}

module.exports = { authRequired, adminOnly };
