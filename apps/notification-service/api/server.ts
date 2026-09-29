import "dotenv/config";
import { createNotificationServer } from "../dist/server.js";

/**
 * Vercel function entry, served at `/api/server` and rewritten to `/` by
 * `vercel.json`.
 *
 * Vercel only performs a WebSocket upgrade when the function default-exports
 * the `http.Server` instance itself. A bare `export default app.fetch` — what
 * payment-service does — can serve HTTP but cannot upgrade a connection. This
 * is the Hono shape from Vercel's WebSocket docs.
 *
 * Imports from `dist/`, not `src/`: `turbo run build` runs before the function
 * is assembled, so the compiled output is guaranteed to exist. Depending on
 * `../src/server.js` would instead rely on the bundler rewriting a `.js`
 * specifier to its `.ts` sibling.
 */
export default createNotificationServer();
