import { NextRequest, NextResponse } from 'next/server';
import { getDistributionRequestByUniqueId, updateDistributionRequestStatus } from '@/lib/distribution';
import { isValidDistributionRequestId } from '@/lib/distribution-utils';
import { sendDistributorDeclineNotification } from '@/lib/distributor-email';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate the ID format
    if (!isValidDistributionRequestId(id)) {
      return NextResponse.json(
        { error: 'Invalid request ID format' },
        { status: 400 }
      );
    }

    // Get the distribution request
    const distributionRequest = await getDistributionRequestByUniqueId(id);

    if (!distributionRequest) {
      return NextResponse.json(
        { error: 'Distribution request not found' },
        { status: 404 }
      );
    }

    // Check if already processed
    if (distributionRequest.status !== 'pending') {
      return NextResponse.json(
        { 
          error: 'Request already processed',
          status: distributionRequest.status,
          processedAt: distributionRequest.respondedAt
        },
        { status: 409 }
      );
    }

    // Update status to declined
    const updatedRequest = await updateDistributionRequestStatus(id, 'declined');

    if (!updatedRequest) {
      return NextResponse.json(
        { error: 'Failed to update request status' },
        { status: 500 }
      );
    }

    // Send decline notification email to applicant
    try {
      await sendDistributorDeclineNotification({
        applicantEmail: updatedRequest.emailAddress,
        applicantName: updatedRequest.fullName,
        businessName: updatedRequest.businessName,
      });
      console.log('Decline notification email sent to:', updatedRequest.emailAddress);
    } catch (emailError) {
      console.error('Failed to send decline notification email:', emailError);
      // Don't fail the request if email fails - the decline is still valid
    }

    return NextResponse.json({
      success: true,
      message: 'Distribution request declined successfully',
      request: {
        id: updatedRequest.id,
        businessName: updatedRequest.businessName,
        contactName: updatedRequest.fullName,
        status: updatedRequest.status,
        declinedAt: updatedRequest.respondedAt
      }
    });

  } catch (error) {
    console.error('Error declining distribution request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Handle POST requests the same way as GET for this endpoint
  return GET(request, { params });
}
