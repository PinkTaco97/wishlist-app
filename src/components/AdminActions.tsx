"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import AddItemModal from "@/components/AddItemModal";

export default function AdminActions({
  existingCategories,
}: {
  existingCategories: string[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleImportChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImporting(true);
    setMessage(null);
    try {
      const text = await file.text();
      const res = await fetch("/api/items/import", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: text,
      });
      const data = await res.json();

      if (res.ok) {
        const parts = [`Imported ${data.imported} item${data.imported === 1 ? "" : "s"}.`];
        if (data.skipped > 0) parts.push(`Skipped ${data.skipped} row(s) with no title.`);
        setMessage(parts.join(" "));
        router.refresh();
      } else {
        setMessage(data.error ?? "Import failed.");
      }
    } finally {
      setImporting(false);
    }
  }

  async function handleDeleteAll() {
    const confirmed = window.confirm(
      "Delete ALL wishlist items? This cannot be undone.",
    );
    if (!confirmed) return;

    setDeleting(true);
    setMessage(null);
    try {
      await fetch("/api/items", { method: "DELETE" });
      setMessage("All items deleted.");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-black/[.08] bg-white p-4 text-sm dark:border-white/[.145] dark:bg-zinc-950">
      <p className="font-medium text-black dark:text-zinc-50">Manage wishlist</p>
      <div className="flex flex-wrap items-center gap-3">
        <AddItemModal existingCategories={existingCategories} />
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page navigation */}
        <a
          href="/api/items/export"
          className="rounded-full border border-black/[.08] px-4 py-1.5 text-sm hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.06]"
        >
          Export CSV
        </a>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="rounded-full border border-black/[.08] px-4 py-1.5 text-sm hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.145] dark:hover:bg-white/[.06]"
        >
          {importing ? "Importing..." : "Import CSV"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleImportChange}
        />
        <button
          type="button"
          onClick={handleDeleteAll}
          disabled={deleting}
          className="rounded-full border border-red-200 px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
        >
          {deleting ? "Deleting..." : "Delete all items"}
        </button>
      </div>
      {message && <p className="text-zinc-500 dark:text-zinc-400">{message}</p>}
    </div>
  );
}
