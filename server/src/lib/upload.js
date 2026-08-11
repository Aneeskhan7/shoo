import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * New uploads go straight to Cloudinary (see lib/cloudinary.js) — multer
 * only needs to hold the file in memory long enough to hand its buffer off,
 * no local disk write anymore.
 *
 * UPLOAD_DIR/publicUrlFor stay exported and this directory is still served
 * at /uploads (see index.js): images uploaded before this migration have
 * ProductImage.url pointing at local files here, and no publicId, so the
 * admin delete path falls back to removing them from disk instead of
 * calling Cloudinary. Nothing pre-existing breaks.
 */
export const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/products');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadProductImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, WebP or AVIF images are allowed'));
    }
    cb(null, true);
  },
}).single('image');

/** Absolute URL for a legacy local file — only used by the delete-image
 *  fallback path now (see adminProductController.js). */
export const publicUrlFor = (req, filename) =>
  `${req.protocol}://${req.get('host')}/uploads/products/${filename}`;
