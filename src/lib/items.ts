import { db } from "@/lib/db";

export type WishlistItem = {
  id: number;
  title: string;
  url: string | null;
  notes: string | null;
  price: number | null;
  created_at: string;
};

export function getAllItems(): WishlistItem[] {
  return db
    .prepare("SELECT * FROM items ORDER BY created_at DESC")
    .all() as WishlistItem[];
}

export function addItem(input: {
  title: string;
  url?: string | null;
  notes?: string | null;
  price?: number | null;
}): WishlistItem {
  const result = db
    .prepare(
      "INSERT INTO items (title, url, notes, price) VALUES (@title, @url, @notes, @price)",
    )
    .run({
      title: input.title,
      url: input.url ?? null,
      notes: input.notes ?? null,
      price: input.price ?? null,
    });

  return db
    .prepare("SELECT * FROM items WHERE id = ?")
    .get(result.lastInsertRowid) as WishlistItem;
}

export function deleteItem(id: number): void {
  db.prepare("DELETE FROM items WHERE id = ?").run(id);
}
