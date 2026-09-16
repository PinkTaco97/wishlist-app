"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal";
import WishlistItemForm from "@/components/WishlistItemForm";

const menuItemClass =
  "block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-black/[.04] disabled:opacity-50 dark:hover:bg-white/[.06]";
const menuItemDefaultColor = "text-zinc-700 dark:text-zinc-300";
const menuItemDangerColor = "text-red-600 dark:text-red-400";

export default function AvatarMenu({
  existingCategories,
}: {
  existingCategories: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await fetch("/api/logout", { method: "POST" });
    router.refresh();
  }

  async function handleImportChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const res = await fetch("/api/items/import", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: text,
      });
      const data = await res.json();

      if (res.ok) {
        window.alert(
          `Imported ${data.imported} item${data.imported === 1 ? "" : "s"}.` +
            (data.skipped > 0
              ? ` Skipped ${data.skipped} row(s) with no title.`
              : ""),
        );
        router.refresh();
      } else {
        window.alert(data.error ?? "Import failed.");
      }
    } finally {
      setImporting(false);
    }
  }

  async function handleDeleteAll() {
    setOpen(false);
    const confirmed = window.confirm(
      "Delete ALL wishlist items? This cannot be undone.",
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await fetch("/api/items", { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="block h-9 w-9 overflow-hidden rounded-full border border-black/[.08] dark:border-white/[.145]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local static asset, not worth next/image config for a tiny avatar */}
        <img
          src="/dp.jpg"
          alt="Account"
          className="h-full w-full object-cover"
        />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-56 rounded-lg border border-black/[.08] bg-white p-1 shadow-lg dark:border-white/[.145] dark:bg-zinc-950">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setAddModalOpen(true);
            }}
            className={`${menuItemClass} ${menuItemDefaultColor}`}
          >
            New item
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page navigation */}
          <a
            href="/api/items/export"
            onClick={() => setOpen(false)}
            className={`${menuItemClass} ${menuItemDefaultColor}`}
          >
            Export CSV
          </a>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className={`${menuItemClass} ${menuItemDefaultColor}`}
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
            className={`${menuItemClass} ${menuItemDangerColor}`}
          >
            {deleting ? "Deleting..." : "Delete all"}
          </button>
          <div className="my-1 border-t border-black/[.08] dark:border-white/[.145]" />
          <button
            type="button"
            onClick={handleLogout}
            className={`${menuItemClass} ${menuItemDefaultColor}`}
          >
            Sign out
          </button>
        </div>
      )}

      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add to wishlist"
      >
        <WishlistItemForm
          existingCategories={existingCategories}
          onDone={() => setAddModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
