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
  zipCode: string;
  country?: string;
  phone?: string;
}

interface BillingInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

interface AdminOrderNotificationEmailProps {
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
  orderDate: string;
}

export const AdminOrderNotificationEmail: React.FC<Readonly<AdminOrderNotificationEmailProps>> = ({
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
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#d97706', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: '0', fontSize: '24px' }}>🎉 New Order Received!</h1>
        <p style={{ color: '#fef3c7', fontSize: '16px', margin: '5px 0 0 0' }}>Force Dowels Order Notification</p>
      </div>
      
      <div style={{ padding: '30px', backgroundColor: 'white' }}>
        {/* Alert Box */}
        <div style={{ 
          backgroundColor: '#ecfdf5', 
          border: '2px solid #10b981', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#065f46', margin: '0 0 10px 0', fontSize: '20px' }}>💰 Payment Successful!</h2>
          <p style={{ color: '#047857', margin: '0', fontSize: '16px' }}>
            A new order has been placed and payment has been confirmed.
          </p>
        </div>

        {/* Customer Information */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#374151', borderBottom: '2px solid #d97706', paddingBottom: '10px', marginBottom: '15px' }}>
            👤 Customer Information
          </h3>
          <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '6px' }}>
            <p style={{ margin: '5px 0', color: '#374151' }}><strong>Name:</strong> {customerName}</p>
            <p style={{ margin: '5px 0', color: '#374151' }}><strong>Email:</strong> {customerEmail}</p>
            <p style={{ margin: '5px 0', color: '#374151' }}><strong>Order Date:</strong> {orderDate}</p>
            <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '14px' }}><strong>Stripe Session:</strong> {stripeSessionId}</p>
          </div>
        </div>

        {/* Order Items */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#374151', borderBottom: '2px solid #d97706', paddingBottom: '10px', marginBottom: '15px' }}>
            📦 Order Items
          </h3>
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '6px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#374151', fontSize: '14px', fontWeight: 'bold' }}>Product</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#374151', fontSize: '14px', fontWeight: 'bold' }}>Tier</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#374151', fontSize: '14px', fontWeight: 'bold' }}>Qty</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#374151', fontSize: '14px', fontWeight: 'bold' }}>Unit Price</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#374151', fontSize: '14px', fontWeight: 'bold' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', color: '#374151' }}>{item.name}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>{item.tier}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#374151', fontWeight: 'bold' }}>
                      {formatNumber(item.quantity)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#374151' }}>
                      ${formatPrice(item.pricePerUnit)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#374151', fontWeight: 'bold' }}>
                      ${formatPrice(item.quantity * item.pricePerUnit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#374151', borderBottom: '2px solid #d97706', paddingBottom: '10px', marginBottom: '15px' }}>
            💰 Order Summary
          </h3>
          <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Subtotal:</span>
              <span style={{ color: '#374151', fontWeight: 'bold' }}>${formatPrice(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Shipping ({shippingOption}):</span>
              <span style={{ color: '#374151', fontWeight: 'bold' }}>${formatPrice(shippingCost)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#6b7280' }}>Tax:</span>
              <span style={{ color: '#374151', fontWeight: 'bold' }}>${formatPrice(taxAmount)}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              paddingTop: '12px', 
              borderTop: '2px solid #d97706',
              fontSize: '18px'
            }}>
              <span style={{ color: '#374151', fontWeight: 'bold' }}>Total:</span>
              <span style={{ color: '#d97706', fontWeight: 'bold' }}>${formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#374151', borderBottom: '2px solid #d97706', paddingBottom: '10px', marginBottom: '15px' }}>
            🚚 Shipping Information
          </h3>
          <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '6px' }}>
            <p style={{ margin: '5px 0', color: '#374151' }}><strong>{shippingInfo.name}</strong></p>
            <p style={{ margin: '5px 0', color: '#6b7280' }}>{shippingInfo.address}</p>
            <p style={{ margin: '5px 0', color: '#6b7280' }}>
              {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
            </p>
            {shippingInfo.country && (
              <p style={{ margin: '5px 0', color: '#6b7280' }}>{shippingInfo.country}</p>
            )}
            {shippingInfo.phone && (
              <p style={{ margin: '5px 0', color: '#6b7280' }}>Phone: {shippingInfo.phone}</p>
            )}
          </div>
        </div>

        {/* Billing Information */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#374151', borderBottom: '2px solid #d97706', paddingBottom: '10px', marginBottom: '15px' }}>
            💳 Billing Information
          </h3>
          <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '6px' }}>
            <p style={{ margin: '5px 0', color: '#374151' }}><strong>{billingInfo.name}</strong></p>
            <p style={{ margin: '5px 0', color: '#6b7280' }}>{billingInfo.address}</p>
            <p style={{ margin: '5px 0', color: '#6b7280' }}>
              {billingInfo.city}, {billingInfo.state} {billingInfo.zipCode}
            </p>
            {billingInfo.country && (
              <p style={{ margin: '5px 0', color: '#6b7280' }}>{billingInfo.country}</p>
            )}
          </div>
        </div>

        {/* Action Required */}
        <div style={{ 
          backgroundColor: '#fef3c7', 
          border: '2px solid #f59e0b', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#92400e', margin: '0 0 10px 0' }}>⚡ Action Required</h3>
          <p style={{ color: '#b45309', margin: '0', fontSize: '16px' }}>
            Please process this order and prepare it for shipment. The customer has been notified of their successful purchase.
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '20px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', margin: '0', fontSize: '14px' }}>
          This is an automated notification from your Force Dowels order system.
        </p>
        <p style={{ color: '#9ca3af', margin: '5px 0 0 0', fontSize: '12px' }}>
          © {new Date().getFullYear()} Force Dowels. All rights reserved.
        </p>
      </div>
    </div>
  );
};
