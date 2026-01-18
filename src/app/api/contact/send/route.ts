import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/mortech/email-service';
import { z } from 'zod';

// Validation schema
const contactFormSchema = z.object({
  recipientEmail: z.string().email('Invalid recipient email address'),
  senderName: z.string().min(1, 'Sender name is required'),
  senderEmail: z.string().email('Invalid sender email address'),
  senderPhone: z.string().min(1, 'Phone number is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
  templateColors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    background: z.string().optional(),
    text: z.string().optional(),
    textSecondary: z.string().optional(),
    border: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = contactFormSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }
    
    const {
      recipientEmail,
      senderName,
      senderEmail,
      senderPhone,
      message,
      templateColors,
    } = validationResult.data;
    
    // Send the contact email
    const result = await sendContactEmail(
      recipientEmail,
      senderName,
      senderEmail,
      senderPhone,
      message,
      templateColors
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Contact message sent successfully',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Failed to send contact message',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in contact send API:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          errors: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

