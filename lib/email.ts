import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/components/email-templates/order-confirmation';

// Initialize Resend with API key
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_123456789'; // Fallback for testing
const resend = new Resend(RESEND_API_KEY);

interface OrderItem {
  name: string;
  quantity: number;
  tier: string;
  pricePerUnit: number;
}

interface SendOrderConfirmationEmailParams {
  customerName: string;
  customerEmail: string;
  orderItems: OrderItem[];
  totalPrice: number;
}

export async function sendOrderConfirmationEmail({
  customerName,
  customerEmail,
  orderItems,
  totalPrice,
}: SendOrderConfirmationEmailParams): Promise<{ success: boolean; error?: any }> {
  try {
    // Format the current date
    const orderDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'Force Dowels <onboarding@resend.dev>', // Use Resend's default domain for testing
      to: [customerEmail],
      subject: 'Your Force Dowels Order Confirmation',
      react: OrderConfirmationEmail({
        customerName,
        orderItems,
        totalPrice,
        orderDate,
      }),
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Exception sending email:', error);
    return { success: false, error };
  }
}
