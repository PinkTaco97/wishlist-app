"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import WishlistItemForm from "@/components/WishlistItemForm";

export default function AddItemModal({
  existingCategories,
}: {
  existingCategories: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        New item
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add to wishlist">
        <WishlistItemForm
          existingCategories={existingCategories}
          onDone={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
