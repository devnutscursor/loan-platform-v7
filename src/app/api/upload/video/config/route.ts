import { NextResponse } from 'next/server';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET_VIDEO || process.env.CLOUDINARY_UPLOAD_PRESET;

/**
 * GET /api/upload/video/config
 * Returns Cloudinary config for direct (browser) upload. Avoids sending large
 * video through our API and prevents "Failed to parse body as FormData" / body size limits.
 */
export async function GET() {
  if (!cloudName || !uploadPreset) {
    return NextResponse.json(
      {
        success: false,
        error: 'Video upload not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET_VIDEO.',
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    success: true,
    cloudName,
    uploadPreset,
  });
}
