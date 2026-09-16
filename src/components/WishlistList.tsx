"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { WishlistItem } from "@/lib/items";
import EditItemForm from "@/components/EditItemForm";
import WishlistCard from "@/components/WishlistCard";
import Modal from "@/components/Modal";

const PAGE_SIZE = 12;
const UNCATEGORIZED = "__uncategorized__";
const ALL_CATEGORIES = "";

function getColumnCount(width: number): number {
  if (width >= 768) return 3;
  if (width >= 640) return 2;
  return 1;
}

function distributeIntoColumns<T>(items: T[], columnCount: number): T[][] {
  const columns: T[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, i) => columns[i % columnCount].push(item));
  return columns;
}

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
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [columnCount, setColumnCount] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.category).filter((c): c is string => !!c)),
      ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
    [items],
  );

  const filteredItems = useMemo(() => {
    if (categoryFilter === ALL_CATEGORIES) return items;
    if (categoryFilter === UNCATEGORIZED) {
      return items.filter((item) => !item.category);
    }
    return items.filter((item) => item.category === categoryFilter);
  }, [items, categoryFilter]);

  const sortedItems = useMemo(
    () => sortItems(filteredItems, sort),
    [filteredItems, sort],
  );
  const visibleItems = sortedItems.slice(0, visibleCount);
  const hasMore = visibleCount < sortedItems.length;
  const columnItems = useMemo(
    () => distributeIntoColumns(visibleItems, columnCount),
    [visibleItems, columnCount],
  );
  const editingItem = items.find((item) => item.id === editingId) ?? null;

  // Re-collapse to the first page whenever sort/filter changes, adjusted
  // during render (per React's guidance) rather than in an effect.
  const [prevKey, setPrevKey] = useState(`${sort}:${categoryFilter}`);
  const currentKey = `${sort}:${categoryFilter}`;
  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    setVisibleCount(PAGE_SIZE);
  }

  useEffect(() => {
    // Column count depends on viewport width, which is browser-only state
    // with no render-time equivalent — genuinely needs an effect.
    function updateColumnCount() {
      setColumnCount(getColumnCount(window.innerWidth));
    }
    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((count) => Math.min(count + PAGE_SIZE, sortedItems.length));
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, sortedItems.length]);

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
      <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <label htmlFor="category" className="text-zinc-500 dark:text-zinc-400">
            Category
          </label>
          <select
            id="category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border border-black/[.08] bg-transparent px-2 py-1 text-sm dark:border-white/[.145]"
          >
            <option value={ALL_CATEGORIES}>All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value={UNCATEGORIZED}>Uncategorized</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      {sortedItems.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No items in this category.
        </p>
      ) : (
        <>
          <div className="flex gap-5">
            {columnItems.map((column, columnIndex) => (
              <div key={columnIndex} className="flex flex-1 flex-col gap-5">
                {column.map((item) => (
                  <WishlistCard
                    key={item.id}
                    item={item}
                    canEdit={canEdit}
                    onEdit={() => setEditingId(item.id)}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </div>
            ))}
          </div>

          {hasMore && <div ref={sentinelRef} className="h-1" />}
        </>
      )}

      <Modal
        open={editingItem != null}
        onClose={() => setEditingId(null)}
        title="Edit item"
      >
        {editingItem && (
          <EditItemForm
            item={editingItem}
            existingCategories={categories}
            onDone={() => {
              setEditingId(null);
              router.refresh();
            }}
            onCancel={() => setEditingId(null)}
          />
        )}
      </Modal>
    </div>
  );
}
