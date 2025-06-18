import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/components/email-templates/order-confirmation';
import { AdminOrderNotificationEmail } from '@/components/email-templates/admin-order-notification';

// Initialize Resend with API key
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set in environment variables');
}

const resend = new Resend(RESEND_API_KEY);

interface OrderItem {
  name: string;
  quantity: number;
  tier: string;
  pricePerUnit: number;
}

interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  phone?: string;
}

interface BillingInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

interface SendOrderConfirmationEmailParams {
  customerName: string;
  customerEmail: string;
  orderItems: OrderItem[];
  subtotal: number;
  shippingCost: number;
  shippingOption: string;
  taxAmount: number;
  taxRate: number;
  totalPrice: number;
  shippingInfo: ShippingInfo;
  billingInfo?: BillingInfo;
  stripeSessionId?: string;
}

interface SendAdminOrderNotificationParams {
  customerName: string;
  customerEmail: string;
  orderItems: OrderItem[];
  subtotal: number;
  shippingCost: number;
  shippingOption: string;
  taxAmount: number;
  totalPrice: number;
  shippingInfo: ShippingInfo;
  billingInfo: BillingInfo;
  stripeSessionId: string;
}

export async function sendOrderConfirmationEmail({
  customerName,
  customerEmail,
  orderItems,
  subtotal,
  shippingCost,
  shippingOption,
  taxAmount,
  taxRate,
  totalPrice,
  shippingInfo,
  billingInfo,
  stripeSessionId,
}: SendOrderConfirmationEmailParams): Promise<{ success: boolean; error?: any }> {
  try {
    // Format the current date
    const orderDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    console.log('Attempting to send order confirmation email to:', customerEmail);
    console.log('Using API key:', RESEND_API_KEY ? 'API key is set' : 'API key is missing');

    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'Force Dowels <noreply@forcedowels.com>', // Use verified domain
      to: [customerEmail],
      subject: 'Your Force Dowels Order Confirmation',
      react: OrderConfirmationEmail({
        customerName,
        orderItems,
        subtotal,
        shippingCost,
        shippingOption,
        taxAmount,
        taxRate,
        totalPrice,
        shippingInfo,
        billingInfo,
        orderDate,
        stripeSessionId,
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

export async function sendAdminOrderNotification({
  customerName,
  customerEmail,
  orderItems,
  subtotal,
  shippingCost,
  shippingOption,
  taxAmount,
  totalPrice,
  shippingInfo,
  billingInfo,
  stripeSessionId,
}: SendAdminOrderNotificationParams): Promise<{ success: boolean; error?: any }> {
  try {
    // Format the current date
    const orderDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    console.log('Attempting to send admin notification email');
    console.log('Using API key:', RESEND_API_KEY ? 'API key is set' : 'API key is missing');

    // Send the admin notification email
    const { data, error } = await resend.emails.send({
      from: 'Force Dowels Orders <orders@forcedowels.com>', // Use verified domain
      to: ['cjmccann00@gmail.com'], // Admin email
      subject: `🎉 New Order Received - $${totalPrice.toFixed(2)} from ${customerName}`,
      react: AdminOrderNotificationEmail({
        customerName,
        customerEmail,
        orderItems,
        subtotal,
        shippingCost,
        shippingOption,
        taxAmount,
        totalPrice,
        shippingInfo,
        billingInfo,
        stripeSessionId,
        orderDate,
      }),
    });

    if (error) {
      console.error('Error sending admin notification email:', error);
      return { success: false, error };
    }

    console.log('Admin notification email sent successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Exception sending admin notification email:', error);
    return { success: false, error };
  }
}
