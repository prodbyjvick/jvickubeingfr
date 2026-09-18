import Link from "next/link";
import { fulfillStripeSession } from "@/lib/checkout";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payment received" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  if (!sessionId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Missing checkout session</h1>
        <Link href="/catalog" className="mt-6 inline-block text-accent">
          Back to catalog
        </Link>
      </div>
    );
  }

  let token: string | null = null;
  const existing = await prisma.order.findUnique({ where: { stripeSessionId: sessionId } });
  if (existing?.status === "paid") {
    token = existing.downloadToken;
  } else {
    const stripe = getStripe();
    if (stripe) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const order = await fulfillStripeSession({
        id: session.id,
        payment_status: session.payment_status,
        customer_details: session.customer_details,
        customer_email: session.customer_email,
        payment_intent: session.payment_intent,
        metadata: session.metadata as Record<string, string> | null,
      });
      token = order.downloadToken;
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">We are confirming payment</h1>
        <p className="mt-3 text-sm text-muted">
          If you were charged, wait a moment and refresh — or check the email you used at checkout for your download
          centre link once the Stripe webhook lands.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-xs uppercase tracking-[0.22em] text-accent">Paid</p>
      <h1 className="mt-3 font-display text-4xl font-semibold">Payment received</h1>
      <p className="mt-4 text-sm text-muted">
        Your masters are unlocked. Keep this download centre link — file URLs expire after an hour and can be refreshed
        from the centre.
      </p>
      <Link
        href={`/downloads/${token}`}
        className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink"
      >
        Open download centre
      </Link>
    </div>
  );
}
