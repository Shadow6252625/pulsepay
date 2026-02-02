const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 5173);
const ROOT = process.cwd();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const cleaned = decoded === "/" ? "/index.html" : decoded;
  const full = path.join(ROOT, cleaned);
  const rel = path.relative(ROOT, full);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return full;
}

const server = http.createServer((req, res) => {
  const filePath = safePath(req.url || "/");
  if (!filePath) return send(res, 400, { "content-type": "text/plain; charset=utf-8" }, "Bad Request");

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if ((req.url || "/") !== "/") {
        // simple SPA-ish fallback
        return fs.readFile(path.join(ROOT, "index.html"), (e2, html) => {
          if (e2) return send(res, 404, { "content-type": "text/plain; charset=utf-8" }, "Not Found");
          return send(res, 200, { "content-type": MIME[".html"] }, html);
        });
      }
      return send(res, 404, { "content-type": "text/plain; charset=utf-8" }, "Not Found");
    }
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, { "content-type": MIME[ext] || "application/octet-stream" }, data);
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`PulsePay site running at http://localhost:${PORT}`);
});


