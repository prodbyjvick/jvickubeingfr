import { prisma } from "@/lib/prisma";
import { newDownloadToken } from "@/lib/downloads";

export type CheckoutItemInput = {
  beatId: string;
  licenceId: string;
};

export async function resolveCheckoutItems(items: CheckoutItemInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const resolved = [];
  for (const item of items) {
    const row = await prisma.beatLicence.findUnique({
      where: {
        beatId_licenceId: { beatId: item.beatId, licenceId: item.licenceId },
      },
      include: { beat: true, licence: true },
    });
    if (!row || !row.beat.published) {
      throw new Error("A beat in your cart is no longer available.");
    }
    if (row.beat.exclusiveSold) {
      throw new Error(`${row.beat.title} has been sold exclusively.`);
    }
    resolved.push({
      beatId: row.beatId,
      licenceId: row.licenceId,
      title: row.beat.title,
      licenceName: row.licence.name,
      pricePence: row.pricePence,
      masterPath: row.masterPath,
      exclusive: row.licence.slug === "exclusive",
    });
  }
  return resolved;
}

export async function createPaidOrder(opts: {
  email: string;
  items: CheckoutItemInput[];
  stripeSessionId?: string;
  stripePaymentId?: string;
}) {
  const resolved = await resolveCheckoutItems(opts.items);
  const totalPence = resolved.reduce((sum, item) => sum + item.pricePence, 0);
  const downloadToken = newDownloadToken();

  const order = await prisma.order.create({
    data: {
      email: opts.email,
      stripeSessionId: opts.stripeSessionId,
      stripePaymentId: opts.stripePaymentId,
      status: "paid",
      totalPence,
      downloadToken,
      paidAt: new Date(),
      items: {
        create: resolved.map((item) => ({
          beatId: item.beatId,
          licenceId: item.licenceId,
          title: item.title,
          licenceName: item.licenceName,
          pricePence: item.pricePence,
          masterPath: item.masterPath,
        })),
      },
    },
    include: { items: true },
  });

  const exclusiveBeatIds = resolved.filter((item) => item.exclusive).map((item) => item.beatId);
  if (exclusiveBeatIds.length > 0) {
    await prisma.beat.updateMany({
      where: { id: { in: exclusiveBeatIds } },
      data: { exclusiveSold: true, published: true },
    });
  }

  return order;
}

export async function fulfillStripeSession(session: {
  id: string;
  payment_status: string | null;
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
  payment_intent?: string | { id: string } | null;
  metadata?: Record<string, string> | null;
}) {
  if (session.payment_status && session.payment_status !== "paid") {
    throw new Error("Payment is not complete.");
  }

  const existing = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
    include: { items: true },
  });
  if (existing?.status === "paid") return existing;

  const email =
    session.customer_details?.email ||
    session.customer_email ||
    existing?.email ||
    "unknown@buyer.local";

  const items: CheckoutItemInput[] = JSON.parse(session.metadata?.items || "[]");
  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (existing) {
    return prisma.order.update({
      where: { id: existing.id },
      data: {
        status: "paid",
        email,
        stripePaymentId: paymentIntent,
        paidAt: new Date(),
      },
      include: { items: true },
    });
  }

  return createPaidOrder({
    email,
    items,
    stripeSessionId: session.id,
    stripePaymentId: paymentIntent,
  });
}
