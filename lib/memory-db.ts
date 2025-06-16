// In-memory database for development
interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface BillingInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface Order {
  id: number;
  user_id: string;
  user_email?: string;
  user_name?: string;
  quantity: number;
  tier: string;
  total_price: number;
  status: string;
  created_at: string;
  shipping_info?: ShippingInfo;
  billing_info?: BillingInfo;
  payment_status?: string;
  stripe_session_id?: string;
}

// In-memory storage
const orders: Order[] = [];
let nextId = 1;

// Function to create a new order
export async function createOrder(orderData: {
  userId: string;
  userEmail?: string;
  userName?: string;
  quantity: number;
  tier: string;
  totalPrice?: number;
  shippingInfo?: ShippingInfo;
  billingInfo?: BillingInfo;
  paymentStatus?: string;
  stripeSessionId?: string;
}): Promise<Order> {
  const { userId, userEmail, userName, quantity, tier, totalPrice, shippingInfo, billingInfo, paymentStatus, stripeSessionId } = orderData;

  const order: Order = {
    id: nextId++,
    user_id: userId,
    user_email: userEmail,
    user_name: userName,
    quantity,
    tier,
    total_price: totalPrice || 0,
    status: paymentStatus === 'paid' ? 'confirmed' : 'pending',
    created_at: new Date().toISOString(),
    shipping_info: shippingInfo,
    billing_info: billingInfo,
    payment_status: paymentStatus,
    stripe_session_id: stripeSessionId
  };

  orders.push(order);
  return order;
}

// Function to get orders for a specific user
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  return orders.filter(order => order.user_id === userId);
}

// No need to initialize the database for in-memory storage
export async function initializeDatabase(): Promise<void> {
  console.log('Using in-memory database');
  return Promise.resolve();
}
