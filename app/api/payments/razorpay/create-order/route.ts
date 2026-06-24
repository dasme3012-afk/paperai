import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getEffectiveUser } from "@/lib/supabase/server";

/**
 * POST /api/payments/razorpay/create-order
 * Creates a Razorpay order for one-time or subscription payment.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getEffectiveUser();
    if (!user?.email || user.email.includes("guest")) {
      return NextResponse.json({ error: "Please sign in to purchase a plan." }, { status: 401 });
    }

    const { planId, amount } = await request.json();

    if (!planId || !amount) {
      return NextResponse.json({ error: "Missing planId or amount." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay is not configured." }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `order_${planId}_${Date.now()}`,
      notes: {
        planId,
        userId: user.id,
        userEmail: user.email,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (err: any) {
    console.error("Razorpay order creation failed:", err);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}
