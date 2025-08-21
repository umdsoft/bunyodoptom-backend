// utils/uploader.js
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const mime = require('mime-types');

// ixtiyoriy siqish/resize (agar USE_SHARP=1 bo'lsa)
const USE_SHARP = process.env.USE_SHARP === '1';
let sharp = null;
if (USE_SHARP) {
  try { sharp = require('sharp'); } catch (_) { sharp = null; }
}

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_FILE_SIZE = (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024;
const MAX_FILES = Number(process.env.MAX_FILES_PER_UPLOAD) || 10;

// Ruxsat etilgan MIME turlar
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif'
]);

function productUploadDestination(productId) {
  // uploads/products/<productId>/
  return path.join(UPLOAD_DIR, 'products', String(productId));
}

function filenameFromMime(mimetype) {
  const ext = mime.extension(mimetype) || 'bin';
  const rand = crypto.randomBytes(16).toString('hex');
  const stamp = Date.now();
  return `${stamp}_${rand}.${ext}`;
}

async function ensureDir(dir) {
  await fs.ensureDir(dir);
}

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const productId = req.params.productId || req.params.id;
      if (!productId) return cb(new Error('Missing productId in params'));
      const dest = productUploadDestination(productId);
      await ensureDir(dest);
      cb(null, dest);
    } catch (e) {
      cb(e);
    }
  },
  filename: (req, file, cb) => {
    try {
      const name = filenameFromMime(file.mimetype);
      cb(null, name);
    } catch (e) {
      cb(e);
    }
  }
});

function fileFilter(_req, file, cb) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(new Error('Unsupported file type'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES
  }
});

// Ixtiyoriy: faylni siqish/resize (max kenglik/bo'y 1600px)
async function maybeOptimizeImage(filePath) {
  if (!USE_SHARP || !sharp) return;
  try {
    const img = sharp(filePath);
    const meta = await img.metadata();
    if ((meta.width || 0) > 1600 || (meta.height || 0) > 1600) {
      await img.resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).toFile(filePath + '.tmp');
      await fs.move(filePath + '.tmp', filePath, { overwrite: true });
    }
  } catch (e) {
    // optimize xatosi kritikal emas; loglash mumkin
  }
}

module.exports = {
  upload,
  productUploadDestination,
  maybeOptimizeImage
};
