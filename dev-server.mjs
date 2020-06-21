import path from 'path';
import { promises as fs } from 'fs';

import chokidar from 'chokidar';
import debounce from 'lodash.debounce';
import express from 'express';
import mime from 'mime';

import { packagePath } from './util.mjs';

export function createDevServer(distPath) {
  const app     = express();
  const watcher = chokidar.watch(distPath);

  app.get('/-reloader', (_req, res) => {
    res.type('text').write(''); // fetch() is not resolved without sending headers

    const notify = debounce(() => {
      res.write('--- changed ---\n');
    }, 500);

    watcher.on('all', notify);

    const keepalive = setInterval(() => {
      res.write('--- keepalive ---\n');
    }, 30_000);

    res.on('close', () => {
      watcher.off('all', notify);
      clearInterval(keepalive);
    });
  });

  app.get('/-reloader/client', (_req, res) => {
    res.sendFile(packagePath('reloader-client.js'));
  });

  app.get('*', async ({url}, res) => {
    const fpath = (url.endsWith('/') ? `${url}/index.html` : url).replace(/\//g, path.sep);

    if (mime.getType(fpath) === 'text/html') {
      const html = await fs.readFile(path.join(distPath, fpath), 'utf8');

      res.type('html').send(injectReloaderClient(html));
    } else {
      res.sendFile(fpath, {root: distPath});
    }
  });

  return app;
}

function injectReloaderClient(html) {
  return html.replace('</head>', '<script src="/-reloader/client" async></script></head>');
}
