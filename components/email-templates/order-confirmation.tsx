import * as React from 'react';

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

interface OrderConfirmationEmailProps {
  customerName: string;
  orderItems: OrderItem[];
  subtotal: number;
  shippingCost: number;
  shippingOption: string;
  taxAmount: number;
  taxRate: number;
  totalPrice: number;
  shippingInfo: ShippingInfo;
  billingInfo?: BillingInfo;
  orderDate: string;
  stripeSessionId?: string;
}

export const OrderConfirmationEmail: React.FC<Readonly<OrderConfirmationEmailProps>> = ({
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
}) => {
  // Format price with 2 decimal places
  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#f8f4e3', padding: '20px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '12px',
          marginBottom: '15px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <img
            src="https://www.forcedowels.com/fdLogo.jpg"
            alt="Force Dowels Logo"
            style={{
              height: '60px',
              width: 'auto',
              display: 'block'
            }}
          />
        </div>
        <p style={{ color: '#666', fontSize: '16px' }}>Order Confirmation</p>
      </div>
      
      <div style={{ padding: '20px' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Thank you for your order, {customerName}!</h2>
        
        <p style={{ color: '#666', marginBottom: '20px' }}>
          We're pleased to confirm your order has been received and is being processed. 
          Below is a summary of your purchase:
        </p>
        
        <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          <h3 style={{ color: '#333', marginTop: '0' }}>Order Summary</h3>
          <p style={{ color: '#666', margin: '0' }}>Order Date: {orderDate}</p>
          {stripeSessionId && (
            <p style={{ color: '#666', margin: '5px 0 0 0' }}>Order ID: {stripeSessionId.slice(-8).toUpperCase()}</p>
          )}
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Product</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Quantity</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Tier</th>
              <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{item.name}</td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{formatNumber(item.quantity)}</td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{item.tier}</td>
                <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                  ${formatPrice(item.quantity * item.pricePerUnit)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ padding: '10px', textAlign: 'right', color: '#666' }}>Subtotal:</td>
              <td style={{ padding: '10px', textAlign: 'right', color: '#333' }}>
                ${formatPrice(subtotal)}
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={{ padding: '10px', textAlign: 'right', color: '#666' }}>Shipping ({shippingOption}):</td>
              <td style={{ padding: '10px', textAlign: 'right', color: '#333' }}>
                ${formatPrice(shippingCost)}
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={{ padding: '10px', textAlign: 'right', color: '#666' }}>Tax ({(taxRate * 100).toFixed(1)}%):</td>
              <td style={{ padding: '10px', textAlign: 'right', color: '#333' }}>
                ${formatPrice(taxAmount)}
              </td>
            </tr>
            <tr style={{ borderTop: '2px solid #d97706' }}>
              <td colSpan={3} style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>Total:</td>
              <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#d97706', fontSize: '16px' }}>
                ${formatPrice(totalPrice)}
              </td>
            </tr>
          </tfoot>
        </table>

        <h3 style={{ color: '#333', marginTop: '30px', marginBottom: '15px' }}>Shipping Address:</h3>
        <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          <p style={{ margin: '0', color: '#333', fontWeight: 'bold' }}>{shippingInfo.name}</p>
          <p style={{ margin: '5px 0', color: '#666' }}>{shippingInfo.address}</p>
          <p style={{ margin: '5px 0', color: '#666' }}>
            {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}
          </p>
          {shippingInfo.country && (
            <p style={{ margin: '5px 0', color: '#666' }}>{shippingInfo.country}</p>
          )}
          {shippingInfo.phone && (
            <p style={{ margin: '5px 0', color: '#666' }}>Phone: {shippingInfo.phone}</p>
          )}
        </div>

        {billingInfo && JSON.stringify(billingInfo) !== JSON.stringify(shippingInfo) && (
          <>
            <h3 style={{ color: '#333', marginTop: '20px', marginBottom: '15px' }}>Billing Address:</h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
              <p style={{ margin: '0', color: '#333', fontWeight: 'bold' }}>{billingInfo.name}</p>
              <p style={{ margin: '5px 0', color: '#666' }}>{billingInfo.address}</p>
              <p style={{ margin: '5px 0', color: '#666' }}>
                {billingInfo.city}, {billingInfo.state} {billingInfo.zip}
              </p>
              {billingInfo.country && (
                <p style={{ margin: '5px 0', color: '#666' }}>{billingInfo.country}</p>
              )}
            </div>
          </>
        )}

        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
          <p style={{ margin: '0', color: '#065f46' }}>
            <strong>Payment Confirmed</strong><br />
            Your order has been successfully processed and will be prepared for shipment.
          </p>
        </div>

        <p style={{ color: '#666', marginBottom: '20px' }}>
          If you have any questions about your order, please contact our customer service team at
          <a href="mailto:support@forcedowels.com" style={{ color: '#d97706', textDecoration: 'none' }}> support@forcedowels.com</a>.
        </p>
        
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Thank you for choosing Force Dowels for your cabinetry fastening needs!
        </p>
      </div>
      
      <div style={{ backgroundColor: '#f8f4e3', padding: '20px', textAlign: 'center' }}>
        <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
          © {new Date().getFullYear()} Force Dowels. All rights reserved.
        </p>
      </div>
    </div>
  );
};
