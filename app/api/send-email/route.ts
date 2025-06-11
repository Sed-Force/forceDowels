import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { currentUser } from '@clerk/nextjs/server';

// Create reusable transporter object using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let userEmail = '';
    if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
      // Prefer the primary email if available, otherwise take the first one.
      const primaryEmail = clerkUser.emailAddresses.find(email => email.id === clerkUser.primaryEmailAddressId);
      userEmail = primaryEmail ? primaryEmail.emailAddress : clerkUser.emailAddresses[0].emailAddress;
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found or not verified.' },
        { status: 400 } // Bad Request, as email is crucial for this API
      );
    }

    // Get the request body
    const body = await request.json();
    const { orderItems, totalPrice, shippingInfo } = body;

    // Format the current date
    const orderDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Create HTML content for the email
    const customerName = shippingInfo?.name || clerkUser.firstName || clerkUser.username || userEmail.split('@')[0];
    const htmlContent = `
        <h1>Order Confirmation</h1>
        <p>Dear ${customerName},</p>
        <p>Thank you for your order! Here are your order details:</p>
        
        <h2>Order Summary</h2>
        <p>Order Date: ${orderDate}</p>
        
        <h3>Items Ordered:</h3>
        <ul>
          ${orderItems.map((item: any) => `
            <li>
              ${item.quantity}x ${item.tier} - $${(item.quantity * item.pricePerUnit).toFixed(2)}
            </li>
          `).join('')}
        </ul>
        
        <p><strong>Total Price: $${totalPrice.toFixed(2)}</strong></p>
        
        <h3>Shipping Information:</h3>
        <p>
          ${shippingInfo.name}<br>
          ${shippingInfo.address}<br>
          ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zip}<br>
          ${shippingInfo.country}
        </p>
        
        <p>If you have any questions about your order, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br>Force Dowels Team</p>
      `;

    // Send the email
    const mailOptions = {
      from: process.env.SMTP_FROM || 'Force Dowels <orders@forcedowels.com>',
      to: userEmail,
      subject: 'Your Force Dowels Order Confirmation',
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: (error as Error).message },
      { status: 500 }
    );
  }
}

