import { NextRequest, NextResponse } from 'next/server';
import { distributorApplicationSchema } from '@/lib/distributor-validation';
import { sendDistributorApplicationEmail, sendDistributorApplicationConfirmation } from '@/lib/distributor-email';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the form data using Zod schema
    const validationResult = distributorApplicationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const formData = validationResult.data;

    // Send the application email to the business
    const emailResult = await sendDistributorApplicationEmail({
      formData,
    });

    if (!emailResult.success) {
      console.error('Failed to send distributor application email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send application email' },
        { status: 500 }
      );
    }

    // Send confirmation email to the applicant
    try {
      await sendDistributorApplicationConfirmation({
        applicantEmail: formData.emailAddress,
        applicantName: formData.fullName,
        businessName: formData.businessName,
      });
    } catch (confirmationError) {
      // Log the error but don't fail the request since the main email was sent
      console.warn('Failed to send confirmation email to applicant:', confirmationError);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Distributor application submitted successfully' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing distributor application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle file uploads (for business license/reseller certificate)
export async function PUT(request: NextRequest) {
  try {
    // This endpoint could be used for file uploads
    // For now, we'll return a placeholder response
    // In a production environment, you'd want to integrate with a file storage service
    // like AWS S3, Cloudinary, or similar
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, JPEG, or PNG files only.' },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // For now, just return success
    // In production, you would:
    // 1. Upload the file to your storage service
    // 2. Return the file URL or ID
    // 3. Store the reference in your database
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'File uploaded successfully',
        // fileUrl: 'https://your-storage-service.com/files/...'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
