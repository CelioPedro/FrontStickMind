import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? process.cwd());
const port = Number(process.argv[3] ?? 5174);
const host = process.argv[4] ?? '127.0.0.1';

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.png', 'image/png'],
  ['.obj', 'text/plain; charset=utf-8'],
]);

createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${host}:${port}`);
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = resolve(join(root, decodeURIComponent(pathname)));

    if (!file.startsWith(root)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    const body = await readFile(file);
    response.writeHead(200, {
      'content-type': types.get(extname(file)) ?? 'application/octet-stream',
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
}).listen(port, host);
