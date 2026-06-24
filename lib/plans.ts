/**
 * Payment plans configuration — single source of truth for pricing.
 */

export type PlanId = "free" | "pro" | "ultra";

export interface Plan {
  id: PlanId;
  name: string;
  priceINR: number;           // Indian Rupees (monthly)
  priceUSD: number;           // US Dollars (monthly)
  stripePriceId: string;      // Stripe Price ID (set in env)
  razorpayPlanId: string;     // Razorpay Plan ID (set in env)
  imagesPerDay: number;
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    priceINR: 0,
    priceUSD: 0,
    stripePriceId: "",
    razorpayPlanId: "",
    imagesPerDay: 5,
    features: [
      "5 images per 24 hours",
      "Up to 25 images per upload",
      "PDF & DOCX export",
      "AI OCR formatting",
      "Multilingual support",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceINR: 299,
    priceUSD: 4,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
    razorpayPlanId: process.env.NEXT_PUBLIC_RAZORPAY_PRO_PLAN_ID || "",
    imagesPerDay: 100,
    features: [
      "100 images per 24 hours",
      "Up to 25 images per upload",
      "PDF & DOCX export",
      "Priority AI processing",
      "Multilingual support",
      "Project history",
    ],
  },
  ultra: {
    id: "ultra",
    name: "Ultra",
    priceINR: 799,
    priceUSD: 10,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ULTRA_PRICE_ID || "",
    razorpayPlanId: process.env.NEXT_PUBLIC_RAZORPAY_ULTRA_PLAN_ID || "",
    imagesPerDay: 250,
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
  },
};
