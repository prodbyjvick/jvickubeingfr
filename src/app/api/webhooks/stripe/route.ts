import { NextRequest, NextResponse } from "next/server";
import { fulfillStripeSession } from "@/lib/checkout";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret || secret.includes("replace_me")) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const payload = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await fulfillStripeSession({
      id: session.id,
      payment_status: session.payment_status,
      customer_details: session.customer_details,
      customer_email: session.customer_email,
      payment_intent: session.payment_intent,
      metadata: session.metadata as Record<string, string> | null,
    });
  }

  return NextResponse.json({ received: true });
}
