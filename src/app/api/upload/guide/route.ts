import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

type CloudinaryRawUploadResult = {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
};

// POST /api/upload/guide - Upload guide file to Cloudinary
export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('guide') as File;
    const folder = 'officer-content/guides';
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PDF, DOC, DOCX, TXT, and RTF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    console.log('🔍 Guide Upload API: Processing upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // Upload to Cloudinary as raw file
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise<CloudinaryRawUploadResult>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'raw',
            overwrite: false,
            unique_filename: true
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error || !result) {
              return reject(error || new Error('Cloudinary upload failed'));
            }
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              format: result.format || fileExtension.substring(1),
              bytes: result.bytes || file.size
            });
          }
        )
        .end(fileBuffer);
    });

    console.log('✅ Guide Upload API: Upload successful:', {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      format: uploadResult.format,
      size: uploadResult.bytes
    });

    return NextResponse.json({
      success: true,
      data: {
        file_url: uploadResult.secure_url,
        file_name: file.name,
        file_type: file.type || `application/${uploadResult.format}`,
        public_id: uploadResult.public_id,
        file_size: uploadResult.bytes
      },
      message: 'Guide uploaded successfully'
    });

  } catch (error) {
    console.error('❌ Guide Upload API: Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload guide',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

