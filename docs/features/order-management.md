# Order Management System

The Force Dowels application includes a comprehensive order management system that handles the entire order lifecycle from creation to fulfillment.

## Overview

The order management system provides:
- **Order Creation** - Process customer orders from checkout
- **Order Tracking** - Track order status and updates
- **Payment Integration** - Handle payment processing with Stripe
- **Email Notifications** - Automated order confirmations and updates
- **User Dashboard** - Customer order history and details

## Order Lifecycle

### 1. Order Creation
Orders are created when customers complete the checkout process:

```typescript
// Order creation flow
1. Customer adds items to cart
2. Proceeds to checkout
3. Fills shipping/billing information
4. Completes payment via Stripe
5. Webhook creates order record
6. Confirmation email sent
```

### 2. Order Status Flow
```
PENDING → PROCESSING → SHIPPED → DELIVERED
    ↓
CANCELLED (if needed)
```

## Data Structure

### Order Model
```typescript
interface Order {
  id: string
  userId: string
  sessionId: string // Stripe session ID
  status: OrderStatus
  items: OrderItem[]
  shipping: ShippingAddress
  billing: BillingAddress
  totals: OrderTotals
  paymentStatus: PaymentStatus
  createdAt: Date
  updatedAt: Date
}

interface OrderItem {
  id: string
  name: string
  description?: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface OrderTotals {
  subtotal: number
  shipping: number
  tax: number
  total: number
}

type OrderStatus = 
  | 'pending'
  | 'processing' 
  | 'shipped'
  | 'delivered'
  | 'cancelled'

type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
```

## Implementation

### Order Creation (Webhook Handler)
```typescript
// app/api/stripe/webhooks/route.ts
export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature')
  const body = await request.text()
  
  try {
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      
      // Create order from session data
      const order = await createOrderFromSession(session)
      
      // Send confirmation email
      await sendOrderConfirmation(order)
    }
    
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Webhook error', { status: 400 })
  }
}
```

### Order Retrieval
```typescript
// app/api/orders/route.ts
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { userId } = await auth()
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const orders = await getOrdersByUserId(userId)
  
  return Response.json({
    success: true,
    data: orders
  })
}
```

### Individual Order Details
```typescript
// app/api/orders/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth()
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const order = await getOrderById(params.id, userId)
  
  if (!order) {
    return Response.json({ error: 'Order not found' }, { status: 404 })
  }
  
  return Response.json({
    success: true,
    data: order
  })
}
```

## User Interface

### Order History Page
```typescript
// app/orders/page.tsx
import { auth } from '@clerk/nextjs/server'
import { OrderList } from '@/components/order-list'

export default async function OrdersPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      <OrderList userId={userId} />
    </div>
  )
}
```

### Order Details Component
```typescript
// components/order-details.tsx
interface OrderDetailsProps {
  order: Order
}

export function OrderDetails({ order }: OrderDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Order #{order.id}</h2>
          <p className="text-gray-600">
            Placed on {format(order.createdAt, 'PPP')}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Items Ordered</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <OrderItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-3">Shipping Address</h3>
          <AddressCard address={order.shipping} />
          
          <h3 className="font-semibold mb-3 mt-6">Order Summary</h3>
          <OrderSummary totals={order.totals} />
        </div>
      </div>
    </div>
  )
}
```

## Email Notifications

### Order Confirmation Email
```typescript
// emails/order-confirmation.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
} from '@react-email/components'

interface OrderConfirmationProps {
  order: Order
  customerName: string
}

export function OrderConfirmation({ order, customerName }: OrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={heading}>
              Thank you for your order, {customerName}!
            </Text>
            <Text style={paragraph}>
              Your order #{order.id} has been confirmed and is being processed.
            </Text>
            
            {/* Order items */}
            <Section style={itemsSection}>
              <Text style={sectionHeading}>Items Ordered:</Text>
              {order.items.map((item) => (
                <div key={item.id} style={itemRow}>
                  <Text>{item.name} x {item.quantity}</Text>
                  <Text>${(item.totalPrice / 100).toFixed(2)}</Text>
                </div>
              ))}
            </Section>
            
            {/* Order total */}
            <Section style={totalSection}>
              <Text style={totalText}>
                Total: ${(order.totals.total / 100).toFixed(2)}
              </Text>
            </Section>
            
            <Button
              href={`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.id}`}
              style={button}
            >
              View Order Details
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
```

## Order Status Updates

### Status Update System
```typescript
// lib/order-status.ts
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  trackingNumber?: string
) {
  const order = await updateOrder(orderId, {
    status: newStatus,
    trackingNumber,
    updatedAt: new Date(),
  })
  
  // Send status update email
  await sendStatusUpdateEmail(order)
  
  return order
}

export async function sendStatusUpdateEmail(order: Order) {
  const customer = await getUserById(order.userId)
  
  const emailContent = await render(
    StatusUpdateEmail({
      order,
      customerName: customer.firstName,
    })
  )
  
  await resend.emails.send({
    from: 'Force Dowels <orders@forcedowels.com>',
    to: customer.email,
    subject: `Order Update: ${order.id}`,
    html: emailContent,
  })
}
```

## Admin Features

### Order Management Dashboard
```typescript
// app/admin/orders/page.tsx (Admin only)
export default async function AdminOrdersPage() {
  const orders = await getAllOrders()
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Order Management</h1>
      
      <div className="bg-white rounded-lg shadow">
        <OrderTable orders={orders} />
      </div>
    </div>
  )
}
```

### Bulk Actions
- Update multiple order statuses
- Export order data
- Generate shipping labels
- Send bulk notifications

## Integration Points

### Stripe Integration
- Payment processing
- Webhook handling
- Refund processing
- Payment status updates

### Shipping Integration
- Calculate shipping rates
- Generate shipping labels
- Track shipments
- Update delivery status

### Inventory Management
- Check product availability
- Update stock levels
- Handle backorders
- Manage reservations

## Security Considerations

### Data Protection
- Encrypt sensitive order data
- Secure payment information
- Protect customer addresses
- Audit order access

### Access Control
- Users can only view their own orders
- Admin access for order management
- Role-based permissions
- Secure API endpoints

## Performance Optimization

### Database Optimization
- Index frequently queried fields
- Optimize order queries
- Implement pagination
- Cache order summaries

### API Performance
- Implement response caching
- Use database connections efficiently
- Optimize webhook processing
- Handle high order volumes

## Testing

### Order Flow Testing
```typescript
// __tests__/order-flow.test.ts
describe('Order Management', () => {
  it('creates order from successful payment', async () => {
    const mockSession = createMockStripeSession()
    const order = await createOrderFromSession(mockSession)
    
    expect(order.status).toBe('pending')
    expect(order.paymentStatus).toBe('paid')
    expect(order.items).toHaveLength(2)
  })
  
  it('updates order status correctly', async () => {
    const order = await createTestOrder()
    const updatedOrder = await updateOrderStatus(order.id, 'shipped')
    
    expect(updatedOrder.status).toBe('shipped')
    expect(updatedOrder.updatedAt).toBeDefined()
  })
})
```

## Future Enhancements

### Planned Features
- Order tracking integration
- Return/refund management
- Subscription orders
- Bulk ordering for distributors
- Advanced reporting and analytics

### Integration Opportunities
- ERP system integration
- Warehouse management
- Customer service tools
- Business intelligence platforms

The order management system provides a solid foundation for handling Force Dowels' e-commerce operations while maintaining flexibility for future growth and enhancements.
