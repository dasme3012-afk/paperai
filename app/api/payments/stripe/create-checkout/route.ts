import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getEffectiveUser } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-11-20.acacia" as any,
    });
    const user = await getEffectiveUser();
    if (!user?.email || user.email.includes("guest")) {
      return NextResponse.json({ error: "Please sign in to purchase a plan." }, { status: 401 });
    }

    const { planId, priceId } = await request.json();

    if (!planId || !priceId) {
      return NextResponse.json({ error: "Missing planId or priceId." }, { status: 400 });
    }


    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        planId,
        userId: user.id,
      },
      success_url: `${appUrl}/dashboard?payment=success&plan=${planId}`,
      cancel_url: `${appUrl}/#pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout creation failed:", err);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
