import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { MongoClient, ObjectId } from "mongodb";
import crypto from "crypto";

// Кластер: UNISTEM. База данных: Ozone-coin. Коллекции: classes, students.
const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = "Ozone-coin"; // именно эта база в кластере UNISTEM
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

const adminTokens = new Set<string>();

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token || !adminTokens.has(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

async function startServer() {
  if (!MONGODB_URI) {
    console.warn("MONGODB_URI not set. Create .env with MONGODB_URI (replace <db_password>).");
  }
  const client = MONGODB_URI ? new MongoClient(MONGODB_URI) : null;

  let dbConnected = false;
  if (client) {
    try {
      await client.connect();
      await client.db(DB_NAME).command({ ping: 1 });
      dbConnected = true;
      console.log(`Connected to MongoDB (cluster UNISTEM, database "${DB_NAME}")`);
    } catch (e) {
      console.error("MongoDB connection failed:", e);
    }
  }

  const getDb = () => {
    if (!client || !dbConnected) throw new Error("Database not connected");
    return client.db(DB_NAME);
  };
  const classesCol = () => getDb().collection<{ _id?: ObjectId; name: string }>("classes");
  const studentsCol = () =>
    getDb().collection<{ _id?: ObjectId; name: string; coins: number; classId: ObjectId }>("students");

  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // ——— Public API (no auth) ———
  app.get("/api/classes", async (req, res) => {
    try {
      const list = await classesCol()
        .find({})
        .project({ _id: 1, name: 1 })
        .toArray();
      res.json(list.map((c) => ({ id: c._id?.toString(), name: c.name })));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch classes" });
    }
  });

  app.get("/api/classes/:classId/students", async (req, res) => {
    try {
      let id: ObjectId;
      try {
        id = new ObjectId(req.params.classId);
      } catch {
        return res.status(400).json({ error: "Invalid class id" });
      }
      const list = await studentsCol()
        .find({ classId: id })
        .sort({ coins: -1 })
        .toArray();
      res.json(
        list.map((s) => ({
          id: s._id?.toString(),
          name: s.name,
          coins: s.coins,
          class_id: s.classId.toString(),
        }))
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  // ——— Admin login ———
  app.post("/api/admin/login", (req, res) => {
    const { user, password } = req.body || {};
    if (user === ADMIN_USER && password === ADMIN_PASSWORD) {
      const token = generateToken();
      adminTokens.add(token);
      res.json({ ok: true, token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (token) adminTokens.delete(token);
    res.json({ ok: true });
  });

  // ——— Protected API (admin only) ———
  app.post("/api/classes", requireAdmin, async (req, res) => {
    const { name } = req.body || {};
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Name required" });
    }
    try {
      const result = await classesCol().insertOne({ name: name.trim() });
      res.json({ id: result.insertedId.toString(), name: name.trim() });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("POST /api/classes failed:", e);
      res.status(500).json({
        error: "Sinf qo‘shib bo‘lmadi",
        details: msg,
      });
    }
  });

  app.delete("/api/classes/:id", requireAdmin, async (req, res) => {
    try {
      const id = new ObjectId(req.params.id);
      await studentsCol().deleteMany({ classId: id });
      const r = await classesCol().deleteOne({ _id: id });
      if (r.deletedCount === 0) return res.status(404).json({ error: "Not found" });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to delete class" });
    }
  });

  app.post("/api/students", requireAdmin, async (req, res) => {
    const { name, classId } = req.body || {};
    if (!name || !classId) return res.status(400).json({ error: "name and classId required" });
    let cid: ObjectId;
    try {
      cid = new ObjectId(classId);
    } catch {
      return res.status(400).json({ error: "Invalid classId" });
    }
    try {
      const result = await studentsCol().insertOne({
        name: String(name).trim(),
        classId: cid,
        coins: 0,
      });
      res.json({
        id: result.insertedId.toString(),
        name: String(name).trim(),
        class_id: classId,
        coins: 0,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to add student" });
    }
  });

  app.delete("/api/students/:id", requireAdmin, async (req, res) => {
    try {
      const id = new ObjectId(req.params.id);
      const r = await studentsCol().deleteOne({ _id: id });
      if (r.deletedCount === 0) return res.status(404).json({ error: "Not found" });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  app.patch("/api/students/:id/coins", requireAdmin, async (req, res) => {
    const { amount } = req.body || {};
    const num = Number(amount);
    if (Number.isNaN(num)) return res.status(400).json({ error: "amount required" });
    try {
      const id = new ObjectId(req.params.id);
      const updated = await studentsCol().findOneAndUpdate(
        { _id: id },
        { $inc: { coins: num } },
        { returnDocument: "after" }
      );
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json({
        id: updated._id?.toString(),
        name: updated.name,
        coins: updated.coins,
        class_id: updated.classId.toString(),
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to update coins" });
    }
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
