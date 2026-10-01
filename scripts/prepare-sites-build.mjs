import { cpSync, mkdirSync, renameSync, rmSync } from "node:fs";

// TanStack Start's Nitro preset emits a Cloudflare Worker in .output.
// Sites packages a Worker from dist/server/index.js and serves dist/client.
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
cpSync(".output/server", "dist/server", { recursive: true });
renameSync("dist/server/index.mjs", "dist/server/index.js");
cpSync(".output/public", "dist/client", { recursive: true });
