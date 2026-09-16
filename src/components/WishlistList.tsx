"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WishlistItem } from "@/lib/items";
import EditItemForm from "@/components/EditItemForm";

export default function WishlistList({
  items,
  canEdit,
}: {
  items: WishlistItem[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No items yet{canEdit ? " — add your first one above." : "."}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) =>
        editingId === item.id ? (
          <EditItemForm
            key={item.id}
            item={item}
            onDone={() => {
              setEditingId(null);
              router.refresh();
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <li
            key={item.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950"
          >
            <div className="flex items-start gap-4">
              {item.image_url && (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary external domains, can't be allow-listed for next/image
                <img
                  src={item.image_url}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-md border border-black/[.08] object-cover dark:border-white/[.145]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
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
            </div>
            {canEdit && (
              <div className="flex shrink-0 gap-3 text-sm">
                <button
                  onClick={() => setEditingId(item.id)}
                  className="text-zinc-500 hover:underline dark:text-zinc-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            )}
          </li>
        ),
      )}
    </ul>
  );
}
