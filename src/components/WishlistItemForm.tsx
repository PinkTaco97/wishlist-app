"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WishlistItemForm({
  existingCategories,
}: {
  existingCategories: string[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, category, price, notes }),
      });

      if (res.ok) {
        setTitle("");
        setUrl("");
        setCategory("");
        setPrice("");
        setNotes("");
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-black/[.08] bg-white p-5 dark:border-white/[.145] dark:bg-zinc-950"
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
          list="category-options"
          className="w-40 rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
          placeholder="Category (optional)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <datalist id="category-options">
          {existingCategories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <input
          className="flex-1 rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        Add to wishlist
      </button>
    </form>
  );
}
