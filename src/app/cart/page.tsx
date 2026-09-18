import { CartView } from "@/components/cart-view";

export const metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-display text-4xl font-semibold">Cart</h1>
      <CartView />
    </div>
  );
}
