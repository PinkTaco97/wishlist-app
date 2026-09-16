import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "wishlist.db");

declare global {
  var __wishlistDb: Database.Database | undefined;
}

function createConnection() {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT,
      notes TEXT,
      price REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return db;
}

// Reuse a single connection across hot reloads in dev instead of opening a new one per request.
export const db = global.__wishlistDb ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  global.__wishlistDb = db;
}
