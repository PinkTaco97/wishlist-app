import { db } from "@/lib/db";

export type WishlistItem = {
  id: number;
  title: string;
  url: string | null;
  image_url: string | null;
  category: string | null;
  notes: string | null;
  price: number | null;
  created_at: string;
};

export function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function normalizeCategory(category: string | null | undefined): string | null {
  if (!category) return null;
  const trimmed = category.trim();
  return trimmed ? trimmed : null;
}

export function getAllItems(): WishlistItem[] {
  return db
    .prepare("SELECT * FROM items ORDER BY created_at DESC")
    .all() as WishlistItem[];
}

export function addItem(input: {
  title: string;
  url?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  notes?: string | null;
  price?: number | null;
}): WishlistItem {
  const result = db
    .prepare(
      "INSERT INTO items (title, url, image_url, category, notes, price) VALUES (@title, @url, @imageUrl, @category, @notes, @price)",
    )
    .run({
      title: input.title,
      url: normalizeUrl(input.url),
      imageUrl: input.imageUrl ?? null,
      category: normalizeCategory(input.category),
      notes: input.notes ?? null,
      price: input.price ?? null,
    });

  return db
    .prepare("SELECT * FROM items WHERE id = ?")
    .get(result.lastInsertRowid) as WishlistItem;
}

export function updateItem(
  id: number,
  input: {
    title: string;
    url?: string | null;
    imageUrl?: string | null;
    category?: string | null;
    notes?: string | null;
    price?: number | null;
  },
): WishlistItem {
  db.prepare(
    "UPDATE items SET title = @title, url = @url, image_url = @imageUrl, category = @category, notes = @notes, price = @price WHERE id = @id",
  ).run({
    id,
    title: input.title,
    url: normalizeUrl(input.url),
    imageUrl: input.imageUrl ?? null,
    category: normalizeCategory(input.category),
    notes: input.notes ?? null,
    price: input.price ?? null,
  });

  return db.prepare("SELECT * FROM items WHERE id = ?").get(id) as WishlistItem;
}

export function deleteItem(id: number): void {
  db.prepare("DELETE FROM items WHERE id = ?").run(id);
}

export function deleteAllItems(): void {
  db.prepare("DELETE FROM items").run();
}
