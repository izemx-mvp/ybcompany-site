// Minimal static server for .output/public that mirrors the Cloudflare asset rules we rely on:
// public/_redirects (301s), <path>/index.html for trailing-slash URLs, 404 otherwise, and
// brotli/gzip for text assets as Cloudflare serves them.
// Used by the browser and Lighthouse checks.   node scripts/serve-static.mjs [port]
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".output/public");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

function loadRedirects() {
  const file = path.join(root, "_redirects");
  if (!fs.existsSync(file)) return new Map();
  return new Map(
    fs
      .readFileSync(file, "utf8")
      .split("\n")
      .map((l) => l.trim().split(/\s+/))
      .filter((p) => p.length >= 2 && !p[0].startsWith("#"))
      .map(([from, to, code]) => [from, { to, code: Number(code ?? 302) }]),
  );
}

export function serve(port = 4310) {
  const redirects = loadRedirects();
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://x");
    const pathname = decodeURIComponent(url.pathname);
    const r = redirects.get(pathname);
    if (r) {
      res.writeHead(r.code, { Location: r.to + url.search });
      return res.end();
    }
    let file = path.join(root, pathname);
    if (!file.startsWith(root)) {
      res.writeHead(403);
      return res.end();
    }
    if (pathname.endsWith("/")) file = path.join(file, "index.html");
    else if (fs.existsSync(path.join(file, "index.html"))) {
      res.writeHead(307, { Location: pathname + "/" });
      return res.end();
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }
    const type = TYPES[path.extname(file)] ?? "application/octet-stream";
    const cache = pathname.startsWith("/assets/")
      ? "public, max-age=31536000, immutable"
      : "no-cache";
    const accept = String(req.headers["accept-encoding"] ?? "");
    const text = /^(text\/|application\/(json|xml)|image\/svg)/.test(type);
    const enc = !text
      ? null
      : accept.includes("br")
        ? "br"
        : accept.includes("gzip")
          ? "gzip"
          : null;
    res.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": cache,
      ...(enc ? { "Content-Encoding": enc, Vary: "Accept-Encoding" } : {}),
    });
    const stream = fs.createReadStream(file);
    if (enc === "br") stream.pipe(zlib.createBrotliCompress()).pipe(res);
    else if (enc === "gzip") stream.pipe(zlib.createGzip()).pipe(res);
    else stream.pipe(res);
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] ?? 4310);
  await serve(port);
  console.log(`serving .output/public on http://localhost:${port}`);
}
