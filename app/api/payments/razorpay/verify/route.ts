import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceSupabase } from "@/lib/supabase/server";

/**
 * POST /api/payments/razorpay/verify
 * Verifies Razorpay payment signature and activates the user's plan.
 */
export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, userId } =
      await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId || !userId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Razorpay not configured." }, { status: 500 });
    }

    // Verify the signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    // Payment verified — activate plan in database
    const supabase = createServiceSupabase();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

    const { error } = await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        plan_id: planId,
        payment_provider: "razorpay",
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        status: "active",
        starts_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("Failed to save subscription:", error);
      // Payment was successful even if DB save fails — log for manual fix
      return NextResponse.json({
        success: true,
        warning: "Payment verified but subscription save failed. Contact support.",
      });
    }

    return NextResponse.json({ success: true, plan: planId });
  } catch (err: any) {
    console.error("Razorpay verification error:", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
