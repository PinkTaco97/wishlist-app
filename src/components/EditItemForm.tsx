"use client";

import { useState } from "react";
import type { WishlistItem } from "@/lib/items";

export default function EditItemForm({
  item,
  onDone,
  onCancel,
}: {
  item: WishlistItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [url, setUrl] = useState(item.url ?? "");
  const [price, setPrice] = useState(item.price != null ? String(item.price) : "");
  const [notes, setNotes] = useState(item.notes ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, price, notes }),
      });

      if (res.ok) onDone();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950"
    >
      <input
        className="rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
        placeholder="Item name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        className="rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
        placeholder="Link (optional)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <div className="flex gap-3">
        <input
          className="w-32 rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
          placeholder="Price"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          className="flex-1 rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
