/**
 * Local dev server: Vite + Express (app from app.ts).
 * On Vercel, only app.ts is used (export default app).
 */
import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import app from "./app";

const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
