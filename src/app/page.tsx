import { getAllItems } from "@/lib/items";
import WishlistItemForm from "@/components/WishlistItemForm";
import WishlistList from "@/components/WishlistList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = getAllItems();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-16">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            My Wishlist
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Things I&apos;d love to get, so friends and family have somewhere
            to look for ideas.
          </p>
        </div>

        <WishlistItemForm />
        <WishlistList items={items} />
      </main>
    </div>
  );
}
