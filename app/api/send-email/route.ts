import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { currentUser } from '@clerk/nextjs/server';
import { OrderConfirmationEmail } from '@/components/email-templates/order-confirmation';

// Initialize Resend with API key
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Get the request body first
    const body = await request.json();
    const {
      orderItems,
      subtotal,
      shippingCost,
      shippingOption,
      taxAmount,
      taxRate,
      totalPrice,
      shippingInfo,
      billingInfo,
      userName,
      userEmail,
      stripeSessionId
    } = body;

    // Check if this is a webhook call (has userEmail in body) or a direct user call
    let customerEmail = '';
    let customerName = '';

    if (userEmail) {
      // This is a webhook call - use the email from the request body
      customerEmail = userEmail;
      customerName = userName || shippingInfo?.name || userEmail.split('@')[0];
      console.log('Processing webhook email request for:', customerEmail);
    } else {
      // This is a direct user call - authenticate with Clerk
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
        // Prefer the primary email if available, otherwise take the first one.
        const primaryEmail = clerkUser.emailAddresses.find(email => email.id === clerkUser.primaryEmailAddressId);
        customerEmail = primaryEmail ? primaryEmail.emailAddress : clerkUser.emailAddresses[0].emailAddress;
      }

      if (!customerEmail) {
        return NextResponse.json(
          { error: 'User email not found or not verified.' },
          { status: 400 }
        );
      }

      customerName = userName || shippingInfo?.name || clerkUser.firstName || clerkUser.username || customerEmail.split('@')[0];
      console.log('Processing direct user email request for:', customerEmail);
    }

    // Validate required fields
    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Customer email is required' },
        { status: 400 }
      );
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    // Format the current date
    const orderDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    console.log('Sending order confirmation email to:', customerEmail);

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Force Dowels <noreply@forcedowels.com>', // Use verified domain
      to: [customerEmail],
      subject: 'Your Force Dowels Order Confirmation',
      react: OrderConfirmationEmail({
        customerName,
        orderItems,
        subtotal: subtotal || 0,
        shippingCost: shippingCost || 0,
        shippingOption: shippingOption || 'Standard',
        taxAmount: taxAmount || 0,
        taxRate: taxRate || 0,
        totalPrice: totalPrice || 0,
        shippingInfo,
        billingInfo,
        orderDate,
        stripeSessionId,
      }),
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: (error as Error).message },
      { status: 500 }
    );
  }
}

