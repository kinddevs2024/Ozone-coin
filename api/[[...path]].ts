/**
 * Vercel serverless catch-all: forwards all /api/* requests to the Express app.
 */
import app from "../app";
import type { IncomingMessage, ServerResponse } from "http";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  app(req, res);
}
