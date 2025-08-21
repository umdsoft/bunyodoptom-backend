const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

function toSafeUser(u) {
  return { id: u.id, uid: u.uid, phone: u.phone, name: u.name, is_admin: !!u.is_admin, brightday: u.brightday };
}
function signToken(user) {
  return jwt.sign(
    { id: user.id, uid: user.uid, is_admin: !!user.is_admin, phone: user.phone, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  );
}

module.exports = {
  /**
   * @openapi
   * /users:
   *   get:
   *     tags: [Users]
   *     summary: List users (admin only)
   *     security: [ { BearerAuth: [] } ]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 20 }
   *     responses:
   *       200: { description: OK }
   */
  list: async (req, res) => {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const users = await User.query()
      .select('id', 'uid', 'phone', 'name', 'is_admin', 'brightday', 'created', 'updated')
      .page(page - 1, limit);
    res.json({ success: true, ...users });
  },

  /**
   * @openapi
   * /users/signup:
   *   post:
   *     tags: [Users]
   *     summary: Signup
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SignupInput'
   *     responses:
   *       201: { description: Created }
   */
  signup: async (req, res) => {
    const { phone, password, name, brightday } = req.body || {};
    if (!phone || !password) return res.status(400).json({ success: false, message: 'phone & password required' });

    const exists = await User.query().findOne({ phone });
    if (exists) return res.status(409).json({ success: false, message: 'Phone already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.query().insert({
      uid: uuidv4(),
      phone,
      password: hashed,
      name: name || null,
      brightday: brightday || null,
      is_admin: 0
    });

    const token = signToken(newUser);
    res.status(201).json({ success: true, data: toSafeUser(newUser), token });
  },

  /**
   * @openapi
   * /users/login:
   *   post:
   *     tags: [Users]
   *     summary: Login
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/LoginInput' }
   *     responses:
   *       200: { description: OK }
   */
  login: async (req, res) => {
    const { phone, password } = req.body || {};
    if (!phone || !password) return res.status(400).json({ success: false, message: 'phone & password required' });

    const user = await User.query().findOne({ phone });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ success: true, data: toSafeUser(user), token });
  },

  /**
   * @openapi
   * /users/me:
   *   get:
   *     tags: [Users]
   *     summary: Get current user profile
   *     security: [ { BearerAuth: [] } ]
   *     responses:
   *       200: { description: OK }
   */
  me: async (req, res) => {
    const user = await User.query().findById(req.user.id);
    res.json({ success: true, data: toSafeUser(user) });
  },

  /**
   * @openapi
   * /users/me:
   *   put:
   *     tags: [Users]
   *     summary: Update profile (name, brightday)
   *     security: [ { BearerAuth: [] } ]
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               brightday: { type: string, format: date }
   *     responses:
   *       200: { description: OK }
   */
  updateMe: async (req, res) => {
    const patch = {};
    if (req.body?.name !== undefined) patch.name = req.body.name;
    if (req.body?.brightday !== undefined) patch.brightday = req.body.brightday;
    const updated = await User.query().patchAndFetchById(req.user.id, patch);
    res.json({ success: true, data: toSafeUser(updated) });
  },

  /**
   * @openapi
   * /users/me/password:
   *   put:
   *     tags: [Users]
   *     summary: Change password
   *     security: [ { BearerAuth: [] } ]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [old_password, new_password]
   *             properties:
   *               old_password: { type: string }
   *               new_password: { type: string, minLength: 6 }
   *     responses:
   *       200: { description: OK }
   */
  changePassword: async (req, res) => {
    const { old_password, new_password } = req.body || {};
    if (!old_password || !new_password) {
      return res.status(400).json({ success: false, message: 'old_password & new_password required' });
    }
    const user = await User.query().findById(req.user.id);
    const ok = await bcrypt.compare(old_password, user.password);
    if (!ok) return res.status(400).json({ success: false, message: 'Old password mismatch' });

    const hashed = await bcrypt.hash(new_password, 10);
    await User.query().patchAndFetchById(req.user.id, { password: hashed });
    res.json({ success: true, message: 'Password changed' });
  }
};
