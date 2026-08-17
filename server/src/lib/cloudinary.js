import { v2 as cloudinary } from 'cloudinary';

/**
 * Lazy-configured, same pattern as lib/resend.js — the server can still boot
 * (and every non-image route still work) if these env vars are unset; only
 * an actual upload/delete call fails, with a clear error.
 */
let configured = false;
function client() {
  if (!configured) {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary credentials are not set in the server environment');
    }
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

/**
 * Uploads a buffer (from multer's memoryStorage — no local disk write).
 * Folder is per-product by slug so the Cloudinary media library reads the
 * same way the catalogue does: shoo/products/<slug>/<asset>.
 */
export function uploadProductImageToCloudinary(buffer, mimetype, { slug }) {
  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;
  return client().uploader.upload(dataUri, {
    folder: `shoo/products/${slug}`,
    resource_type: 'image',
  });
}

/** Best-effort — callers swallow failures rather than blocking a delete on it. */
export function deleteCloudinaryImage(publicId) {
  return client().uploader.destroy(publicId);
}

/** Same pipeline as product images, own folder — shoo/blog/<slug>/<asset>. */
export function uploadBlogCoverToCloudinary(buffer, mimetype, { slug }) {
  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;
  return client().uploader.upload(dataUri, {
    folder: `shoo/blog/${slug}`,
    resource_type: 'image',
  });
}
