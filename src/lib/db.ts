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
      image_url TEXT,
      category TEXT,
      notes TEXT,
      price REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Databases created before these columns existed need them added on.
  const columns = db.prepare("PRAGMA table_info(items)").all() as {
    name: string;
  }[];
  const columnNames = new Set(columns.map((column) => column.name));
  if (!columnNames.has("image_url")) {
    db.exec("ALTER TABLE items ADD COLUMN image_url TEXT");
  }
  if (!columnNames.has("category")) {
    db.exec("ALTER TABLE items ADD COLUMN category TEXT");
  }

  return db;
}

// Reuse a single connection across hot reloads in dev instead of opening a new one per request.
export const db = global.__wishlistDb ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  global.__wishlistDb = db;
}
