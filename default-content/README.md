# Default Content Files

This folder contains default video and guide files that will be automatically uploaded to Cloudinary for each loan officer when they accept their invitation (if their company has default content access enabled).

## Structure

- `videos/` - Video files (.mp4, .webm, .mov, .avi)
- `guides/` - PDF guide files (.pdf)

## Expected Files

### Videos (`videos/`)
Place your video files here with these exact names:
- `welcome-video.mp4`
- `mortgage-process.mp4`
- `loan-types.mp4`
- `credit-score-tips.mp4`

Optional: You can also include thumbnail images with matching names (e.g., `welcome-video-thumbnail.jpg`). If not provided, Cloudinary will auto-generate thumbnails.

### Guides (`guides/`)
Place your PDF guide files here with these exact names:
- `first-time-homebuyer-guide.pdf`
- `pre-approval-checklist.pdf`
- `credit-score-guide.pdf`
- `down-payment-assistance.pdf`

## Notes

- Files are uploaded to Cloudinary when a loan officer accepts their invitation
- Each officer gets their own folder in Cloudinary: `officer-content/videos/{officerId}` and `officer-content/guides/{officerId}`
- If a file is missing, that specific item will be skipped (other items will still be uploaded)
- File names must match exactly what's defined in `src/lib/default-content-uploader.ts`

