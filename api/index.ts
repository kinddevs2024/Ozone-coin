/**
 * Vercel serverless: single entry for all /api/* routes.
 * vercel.json rewrites /api/(.*) -> /api?path=:1 so this function handles every API request.
 */
import app from "../app";
export default app;
