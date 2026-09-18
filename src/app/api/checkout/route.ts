import { NextRequest, NextResponse } from "next/server";
import { createPaidOrder, resolveCheckoutItems } from "@/lib/checkout";
import { demoCheckoutEnabled, getStripe, stripeConfigured } from "@/lib/stripe";
import { publicAppUrl } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      items?: { beatId: string; licenceId: string }[];
    };
    const email = (body.email || "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email for delivery." }, { status: 400 });
    }
    const resolved = await resolveCheckoutItems(body.items || []);
    const appUrl = publicAppUrl();

    if (!stripeConfigured() && demoCheckoutEnabled()) {
      const order = await createPaidOrder({ email, items: body.items || [] });
      return NextResponse.json({ url: `${appUrl}/downloads/${order.downloadToken}?demo=1` });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Add STRIPE_SECRET_KEY or enable ALLOW_DEMO_CHECKOUT for local testing.",
        },
        { status: 503 },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart`,
      metadata: {
        items: JSON.stringify(resolved.map((item) => ({ beatId: item.beatId, licenceId: item.licenceId }))),
      },
      line_items: resolved.map((item) => ({
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: item.pricePence,
          product_data: {
            name: `${item.title} — ${item.licenceName}`,
            description: "Digital beat licence. Instant download after payment.",
          },
        },
      })),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
