import * as React from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  tier: string;
  pricePerUnit: number;
}

interface OrderConfirmationEmailProps {
  customerName: string;
  orderItems: OrderItem[];
  totalPrice: number;
  orderDate: string;
}

export const OrderConfirmationEmail: React.FC<Readonly<OrderConfirmationEmailProps>> = ({
  customerName,
  orderItems,
  totalPrice,
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
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#f8f4e3', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: '#d97706', margin: '0' }}>Force Dowels</h1>
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
              <td colSpan={3} style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
              <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#d97706' }}>
                ${formatPrice(totalPrice)}
              </td>
            </tr>
          </tfoot>
        </table>
        
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
