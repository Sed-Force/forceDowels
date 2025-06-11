import { NextRequest, NextResponse } from 'next/server';
import { createOrder, initializeDatabase, getOrdersByUserId } from '@/lib/memory-db'; // Added getOrdersByUserId
import { auth, currentUser } from '@clerk/nextjs/server';

// Initialize the database when the server starts
initializeDatabase().catch(console.error);



export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      // This case should ideally be caught by auth() check above
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();
    const { quantity, tier, totalPrice, shippingInfo, billingInfo } = body;

    let userEmail = '';
    if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
      userEmail = clerkUser.emailAddresses[0].emailAddress;
    } else {
      // Handle case where primary email might not be available, though unlikely for signed-in users
      // Or, if an email is strictly required, return an error.
      console.warn(`User ${userId} has no primary email address.`);
      // Depending on requirements, you might want to return an error here:
      // return NextResponse.json({ error: 'User email not available' }, { status: 400 });
    }

    const userName = clerkUser.firstName || clerkUser.username || userEmail.split('@')[0];


    // Create the order
    const order = await createOrder({
      userId: userId,
      userEmail: userEmail,
      userName: userName,
      quantity,
      tier,
      totalPrice,
      shippingInfo,
      billingInfo
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get the orders for the user
    const orders = await getOrdersByUserId(userId);

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
