import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Mock order data - In production, fetch from database
const mockOrders: Record<string, any> = {
  'ORD-12345': {
    id: 'order_1',
    orderNumber: 'ORD-12345',
    email: 'customer@example.com',
    status: 'shipped',
    createdAt: '2024-01-10T10:00:00Z',
    items: [
      {
        id: 'item_1',
        name: 'Blue Patterned Camp Collar Shirt',
        quantity: 1,
        price: 25000,
        image: '/Blue Patterned Short-Sleeve Shirt.jpg',
      },
    ],
    shipping: {
      address: '123 Main St, Accra, Ghana',
      method: 'Standard Shipping',
      trackingNumber: 'TRACK123456',
    },
    timeline: [
      {
        id: 'status_1',
        status: 'pending',
        date: '2024-01-10',
        description: 'Order placed',
      },
      {
        id: 'status_2',
        status: 'processing',
        date: '2024-01-11',
        description: 'Order confirmed and processing',
      },
      {
        id: 'status_3',
        status: 'shipped',
        date: '2024-01-12',
        description: 'Order shipped',
        location: 'Accra, Ghana',
      },
    ],
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('number')?.trim();
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: 'Order number and email are required' },
        { status: 400 }
      );
    }

    // In production, query database:
    // const order = await prisma.order.findFirst({
    //   where: {
    //     orderNumber,
    //     email: email.toLowerCase(),
    //   },
    //   include: {
    //     items: {
    //       include: {
    //         product: true,
    //       },
    //     },
    //   },
    // });

    const order = mockOrders[orderNumber];

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found. Please check your order number and email.' },
        { status: 404 }
      );
    }

    // Verify email matches
    if (order.email.toLowerCase() !== email) {
      return NextResponse.json(
        { error: 'Order not found. Please check your order number and email.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Track order error:', error);
    return NextResponse.json(
      { error: 'Failed to track order' },
      { status: 500 }
    );
  }
}
