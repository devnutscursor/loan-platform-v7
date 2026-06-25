import { v2 as cloudinaryV2 } from 'cloudinary';

let _configured = false;

function ensureConfigured() {
  if (_configured) return;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Missing Cloudinary environment variables');
  }
  cloudinaryV2.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  _configured = true;
}

export const cloudinary = new Proxy(cloudinaryV2, {
  get(target, prop, receiver) {
    ensureConfigured();
    return Reflect.get(target, prop, receiver);
  },
});
