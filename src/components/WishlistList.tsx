"use client";

import { useRouter } from "next/navigation";
import type { WishlistItem } from "@/lib/items";

export default function WishlistList({ items }: { items: WishlistItem[] }) {
  const router = useRouter();

  async function handleDelete(id: number) {
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No items yet — add your first one above.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-start justify-between gap-4 rounded-lg border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950"
        >
          <div>
            <p className="font-medium text-black dark:text-zinc-50">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {item.title}
                </a>
              ) : (
                item.title
              )}
              {item.price != null && (
                <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">
                  ${item.price}
                </span>
              )}
            </p>
            {item.notes && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {item.notes}
              </p>
            )}
          </div>
          <button
            onClick={() => handleDelete(item.id)}
            className="text-sm text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
