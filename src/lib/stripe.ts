import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("replace_me")) {
    return null;
  }
  return new Stripe(key);
}

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("replace_me"));
}

export function demoCheckoutEnabled() {
  return process.env.ALLOW_DEMO_CHECKOUT === "true" && process.env.NODE_ENV !== "production";
}
