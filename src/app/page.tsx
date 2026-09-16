import { getAllItems } from "@/lib/items";
import { isAuthenticated } from "@/lib/auth";
import WishlistItemForm from "@/components/WishlistItemForm";
import WishlistList from "@/components/WishlistList";
import AuthControls from "@/components/AuthControls";
import AdminActions from "@/components/AdminActions";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = getAllItems();
  const authed = await isAuthenticated();
  const existingCategories = Array.from(
    new Set(items.map((item) => item.category).filter((c): c is string => !!c)),
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-16">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              My Wishlist
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Things I&apos;d love to get, so friends and family have somewhere
              to look for ideas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AuthControls authed={authed} />
          </div>
        </div>

        {authed && (
          <>
            <WishlistItemForm existingCategories={existingCategories} />
            <AdminActions />
          </>
        )}
        <WishlistList items={items} canEdit={authed} />
      </main>
    </div>
  );
}
