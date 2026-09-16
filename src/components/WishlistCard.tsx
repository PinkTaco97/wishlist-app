"use client";

import { useState } from "react";
import type { WishlistItem } from "@/lib/items";

export default function WishlistCard({
  item,
  canEdit,
  onEdit,
  onDelete,
}: {
  item: WishlistItem;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-black/[.08] bg-white dark:border-white/[.145] dark:bg-zinc-950">
      <div className="flex aspect-square w-full items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        {item.image_url && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary external domains, can't be allow-listed for next/image
          <img
            src={item.image_url}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- simple static asset, not worth next/image config
          <img
            src="/placeholder.svg"
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-sm font-medium text-black dark:text-zinc-50">
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
        </p>
        {item.price != null && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            ${item.price}
          </p>
        )}
        {item.notes && (
          <p className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
            {item.notes}
          </p>
        )}

        {canEdit && (
          <div className="mt-auto flex gap-3 pt-2 text-xs">
            <button
              onClick={onEdit}
              className="text-zinc-500 hover:underline dark:text-zinc-400"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
