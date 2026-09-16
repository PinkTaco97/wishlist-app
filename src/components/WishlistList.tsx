"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { WishlistItem } from "@/lib/items";
import EditItemForm from "@/components/EditItemForm";
import WishlistCard from "@/components/WishlistCard";

type SortOption =
  | "newest"
  | "oldest"
  | "price-desc"
  | "price-asc"
  | "title-asc"
  | "title-desc";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Date added (newest first)",
  oldest: "Date added (oldest first)",
  "price-desc": "Price (high to low)",
  "price-asc": "Price (low to high)",
  "title-asc": "Title (A to Z)",
  "title-desc": "Title (Z to A)",
};

function sortItems(items: WishlistItem[], sort: SortOption): WishlistItem[] {
  const sorted = [...items];

  switch (sort) {
    case "oldest":
      return sorted.sort((a, b) => a.created_at.localeCompare(b.created_at));
    case "price-desc":
      return sorted.sort((a, b) => {
        if (a.price == null) return 1;
        if (b.price == null) return -1;
        return b.price - a.price;
      });
    case "price-asc":
      return sorted.sort((a, b) => {
        if (a.price == null) return 1;
        if (b.price == null) return -1;
        return a.price - b.price;
      });
    case "title-asc":
      return sorted.sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
      );
    case "title-desc":
      return sorted.sort((a, b) =>
        b.title.localeCompare(a.title, undefined, { sensitivity: "base" }),
      );
    case "newest":
    default:
      return sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
}

export default function WishlistList({
  items,
  canEdit,
}: {
  items: WishlistItem[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sort, setSort] = useState<SortOption>("newest");

  const sortedItems = useMemo(() => sortItems(items, sort), [items, sort]);

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2 text-sm">
        <label htmlFor="sort" className="text-zinc-500 dark:text-zinc-400">
          Sort by
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-md border border-black/[.08] bg-transparent px-2 py-1 text-sm dark:border-white/[.145]"
        >
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {sortedItems.map((item) =>
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
            <WishlistCard
              key={item.id}
              item={item}
              canEdit={canEdit}
              onEdit={() => setEditingId(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          ),
        )}
      </div>
    </div>
  );
}
