import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("school_coins.db");
db.pragma('foreign_keys = ON');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    coins INTEGER DEFAULT 0,
    class_id INTEGER,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
  );
`);

// Seed initial data if empty
const classCount = db.prepare("SELECT COUNT(*) as count FROM classes").get() as { count: number };
if (classCount.count === 0) {
  // Empty
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Routes
  app.get("/api/classes", (req, res) => {
    const classes = db.prepare("SELECT * FROM classes").all();
    res.json(classes);
  });

  app.post("/api/classes", (req, res) => {
    const { name } = req.body;
    try {
      const info = db.prepare("INSERT INTO classes (name) VALUES (?)").run(name);
      res.json({ id: info.lastInsertRowid, name });
    } catch (e) {
      res.status(400).json({ error: "Class already exists" });
    }
  });

  app.delete("/api/classes/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM classes WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (e) {
      console.error("Delete error:", e);
      res.status(500).json({ error: "Failed to delete class" });
    }
  });

  app.get("/api/classes/:classId/students", (req, res) => {
    const students = db.prepare("SELECT * FROM students WHERE class_id = ? ORDER BY coins DESC").all(req.params.classId);
    res.json(students);
  });

  app.post("/api/students", (req, res) => {
    const { name, classId } = req.body;
    const info = db.prepare("INSERT INTO students (name, class_id, coins) VALUES (?, ?, 0)").run(name, classId);
    res.json({ id: info.lastInsertRowid, name, class_id: classId, coins: 0 });
  });

  app.delete("/api/students/:id", (req, res) => {
    db.prepare("DELETE FROM students WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.patch("/api/students/:id/coins", (req, res) => {
    const { amount } = req.body;
    db.prepare("UPDATE students SET coins = coins + ? WHERE id = ?").run(amount, req.params.id);
    const updated = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
    res.json(updated);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
