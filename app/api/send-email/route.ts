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
      stripeSessionId
    } = body;

    // Format the current date
    const orderDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Create HTML content for the email
    const customerName = userName || shippingInfo?.name || clerkUser.firstName || clerkUser.username || userEmail.split('@')[0];
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #d97706; border-bottom: 2px solid #d97706; padding-bottom: 10px;">Order Confirmation</h1>
          <p>Dear ${customerName},</p>
          <p>Thank you for your order! Your payment has been processed successfully.</p>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #374151;">Order Details</h2>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            ${stripeSessionId ? `<p><strong>Order ID:</strong> ${stripeSessionId.slice(-8).toUpperCase()}</p>` : ''}
          </div>

          <h3 style="color: #374151;">Items Ordered:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Item</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Qty</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems.map((item: any) => `
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">
                    <strong>${item.name}</strong><br>
                    <small style="color: #6b7280;">Tier: ${item.tier}</small>
                  </td>
                  <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">$${(item.quantity * item.pricePerUnit).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Subtotal:</td>
                <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #e5e7eb;">$${(subtotal || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  Shipping (${shippingOption || 'Standard'}):
                </td>
                <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #e5e7eb;">
                  ${(shippingCost || 0) === 0 ? 'FREE' : `$${(shippingCost || 0).toFixed(2)}`}
                </td>
              </tr>
              ${(taxAmount || 0) > 0 ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    Tax (${((taxRate || 0) * 100).toFixed(1)}%):
                  </td>
                  <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #e5e7eb;">$${(taxAmount || 0).toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr style="font-weight: bold; font-size: 1.1em;">
                <td style="padding: 12px 0; border-top: 2px solid #d97706;">Total:</td>
                <td style="padding: 12px 0; text-align: right; border-top: 2px solid #d97706; color: #d97706;">$${(totalPrice || 0).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <h3 style="color: #374151;">Shipping Address:</h3>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            ${shippingInfo.name}<br>
            ${shippingInfo.address}<br>
            ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zip}<br>
            ${shippingInfo.country}
          </div>

          ${billingInfo && JSON.stringify(billingInfo) !== JSON.stringify(shippingInfo) ? `
            <h3 style="color: #374151;">Billing Address:</h3>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              ${billingInfo.name}<br>
              ${billingInfo.address}<br>
              ${billingInfo.city}, ${billingInfo.state} ${billingInfo.zip}<br>
              ${billingInfo.country}
            </div>
          ` : ''}

          <div style="background-color: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #065f46;">
              <strong>✓ Payment Confirmed</strong><br>
              Your order has been successfully processed and will be prepared for shipment.
            </p>
          </div>

          <p>If you have any questions about your order, please don't hesitate to contact us.</p>

          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>Force Dowels Team</strong>
          </p>
        </div>
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

