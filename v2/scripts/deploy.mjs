// Builds the site, pre-renders the page and puts it at the repository root,
// where the hosting serves it next to lead.php and the sub-pages.
// Usage: npm run deploy  (then commit and push the repository)
import { execSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const app = join(here, "..");
const site = join(app, "..");
const run = (cmd) => execSync(cmd, { cwd: app, stdio: "inherit" });

run("npx tsc --noEmit -p .");
run("npx vite build");
run("npx vite build --ssr src/entry-server.tsx --outDir dist-ssr");

const { render } = await import(pathToFileURL(join(app, "dist-ssr/entry-server.js")).href);
const html = readFileSync(join(app, "dist/index.html"), "utf8").replace('<div id="root"></div>', `<div id="root">${render()}</div>`);
if (!html.includes("Сайти, що")) throw new Error("pre-render did not produce the page");

writeFileSync(join(site, "index.html"), html);
const out = join(site, "assets/v2");
if (existsSync(out)) rmSync(out, { recursive: true });
cpSync(join(app, "dist/assets/v2"), out, { recursive: true });
rmSync(join(app, "dist-ssr"), { recursive: true });
console.log("index.html and assets/v2 updated at the site root");
