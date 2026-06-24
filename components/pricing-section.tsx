"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Check, Zap, Crown, Sparkles, Loader2, Globe } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

type PaymentGateway = "razorpay" | "stripe";

interface PricingProps {
  onLoginRequired: () => void;
}

const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    priceINR: 0,
    priceUSD: 0,
    tagline: "Perfect for occasional use",
    icon: Zap,
    iconColor: "text-white/70",
    iconBg: "bg-white/10",
    features: [
      "5 images per 24 hours",
      "Up to 25 images per upload",
      "PDF & DOCX export",
      "AI OCR formatting",
      "Multilingual support",
    ],
    checkColor: "text-brand",
    cardClass: "border-white/10 bg-white/[0.03]",
    buttonClass: "border border-white/15 bg-white/5 hover:bg-white/10",
    buttonText: "Get started free",
    badge: null,
  },
  {
    id: "pro" as const,
    name: "Pro",
    priceINR: 299,
    priceUSD: 4,
    tagline: "For teachers & coaching centres",
    icon: Crown,
    iconColor: "text-brand",
    iconBg: "bg-brand/20",
    features: [
      "100 images per 24 hours",
      "Up to 25 images per upload",
      "PDF & DOCX export",
      "Priority AI processing",
      "Multilingual support",
      "Project history",
    ],
    checkColor: "text-brand",
    cardClass: "border-brand/50 bg-brand/5 ring-1 ring-brand/20",
    buttonClass: "bg-brand hover:bg-brand/90 font-black",
    buttonText: "Upgrade to Pro",
    badge: "MOST POPULAR",
  },
  {
    id: "ultra" as const,
    name: "Ultra",
    priceINR: 799,
    priceUSD: 10,
    tagline: "For large institutions",
    icon: Sparkles,
    iconColor: "text-yellow-400",
    iconBg: "bg-gradient-to-br from-yellow-400/20 to-orange-400/20",
    features: [
      "250 images per 24 hours",
      "Up to 25 images per upload",
      "PDF & DOCX export",
      "Highest priority processing",
      "Multilingual support",
      "Project history",
      "Team collaboration",
      "API access",
    ],
    checkColor: "text-yellow-400",
    cardClass: "border-white/10 bg-white/[0.03]",
    buttonClass: "border border-yellow-400/30 bg-yellow-400/5 text-yellow-400 hover:bg-yellow-400/10",
    buttonText: "Upgrade to Ultra",
    badge: null,
  },
];

// Load Razorpay script dynamically
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PricingSection({ onLoginRequired }: PricingProps) {
  const [gateway, setGateway] = useState<PaymentGateway>("razorpay");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Detect user region for default gateway
    const detectRegion = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/", { cache: "force-cache" });
        const data = await res.json();
        if (data.country_code !== "IN") {
          setGateway("stripe");
        }
      } catch {
        // Default to razorpay if detection fails
      }
    };
    detectRegion();

    // Get current user
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });
  }, []);

  const handlePurchase = useCallback(
    async (planId: string, priceINR: number, priceUSD: number) => {
      if (planId === "free") {
        window.location.href = "/dashboard";
        return;
      }

      // Must be logged in
      if (!user) {
        onLoginRequired();
        return;
      }

      setLoadingPlan(planId);

      try {
        if (gateway === "razorpay") {
          // ── Razorpay Flow ──
          const loaded = await loadRazorpayScript();
          if (!loaded) {
            toast.error("Failed to load payment gateway.");
            setLoadingPlan(null);
            return;
          }

          const res = await fetch("/api/payments/razorpay/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId, amount: priceINR }),
          });
          const orderData = await res.json();

          if (!res.ok) {
            toast.error(orderData.error || "Failed to create order.");
            setLoadingPlan(null);
            return;
          }

          const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "PaperAI",
            description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan — Monthly`,
            order_id: orderData.orderId,
            handler: async (response: any) => {
              // Verify payment on server
              const verifyRes = await fetch("/api/payments/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  planId,
                  userId: user.id,
                }),
              });
              const verifyData = await verifyRes.json();

              if (verifyData.success) {
                toast.success(`🎉 Upgraded to ${planId.charAt(0).toUpperCase() + planId.slice(1)}!`);
                window.location.href = "/dashboard?payment=success";
              } else {
                toast.error("Payment verification failed. Contact support.");
              }
              setLoadingPlan(null);
            },
            prefill: {
              email: user.email,
            },
            theme: {
              color: "#6C5CE7",
            },
            modal: {
              ondismiss: () => setLoadingPlan(null),
            },
          };

          const razorpay = new (window as any).Razorpay(options);
          razorpay.open();
        } else {
          // ── Stripe Flow ──
          const priceId =
            planId === "pro"
              ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
              : process.env.NEXT_PUBLIC_STRIPE_ULTRA_PRICE_ID;

          const res = await fetch("/api/payments/stripe/create-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId, priceId }),
          });
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.error || "Failed to create checkout session.");
            setLoadingPlan(null);
            return;
          }

          // Redirect to Stripe Checkout
          window.location.href = data.url;
        }
      } catch (err) {
        console.error("Payment error:", err);
        toast.error("Something went wrong. Please try again.");
        setLoadingPlan(null);
      }
    },
    [gateway, user, onLoginRequired]
  );

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 py-20 border-t border-white/5">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black mb-3">Simple pricing</h2>
        <p className="text-white/55 mb-6">Start free, upgrade when you need more.</p>

        {/* Gateway Toggle */}
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-xs">
          <button
            onClick={() => setGateway("razorpay")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 font-bold transition-all cursor-pointer ${
              gateway === "razorpay"
                ? "bg-brand text-white shadow-md"
                : "text-white/50 hover:text-white"
            }`}
          >
            🇮🇳 INR (India)
          </button>
          <button
            onClick={() => setGateway("stripe")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 font-bold transition-all cursor-pointer ${
              gateway === "stripe"
                ? "bg-brand text-white shadow-md"
                : "text-white/50 hover:text-white"
            }`}
          >
            <Globe size={12} /> USD (Global)
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const price = gateway === "razorpay" ? plan.priceINR : plan.priceUSD;
          const currency = gateway === "razorpay" ? "₹" : "$";
          const isLoading = loadingPlan === plan.id;

          return (
            <div key={plan.id} className={`relative rounded-2xl border p-7 ${plan.cardClass}`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-brand px-3 py-1 text-xs font-black text-white">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <div className={`h-8 w-8 rounded-lg ${plan.iconBg} flex items-center justify-center`}>
                  <Icon size={16} className={plan.iconColor} />
                </div>
                <span className="font-black text-lg">{plan.name}</span>
              </div>

              <div className="mb-1">
                <span className="text-4xl font-black">
                  {currency}{price}
                </span>
                <span className="text-white/40 text-sm ml-1">/month</span>
              </div>
              <p className="text-white/50 text-sm mb-6">{plan.tagline}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                    <Check size={15} className={`${plan.checkColor} mt-0.5 flex-shrink-0`} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(plan.id, plan.priceINR, plan.priceUSD)}
                disabled={isLoading}
                className={`block w-full rounded-xl py-2.5 text-center text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${plan.buttonClass}`}
              >
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                {isLoading ? "Processing..." : plan.buttonText}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-white/30 mt-8">
        All plans: max 25 images per upload session · Images, PDFs &amp; Office files only
        <br />
        <span className="text-white/20">
          {gateway === "razorpay" ? "Payments via Razorpay (UPI, Cards, Net Banking)" : "Payments via Stripe (Cards, Apple Pay, Google Pay)"}
        </span>
      </p>
    </section>
  );
}
