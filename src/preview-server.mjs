import EventEmitter from 'events';
import path from 'path';
import { promises as fs } from 'fs';

import BroccoliPlugin from 'broccoli-plugin';
import express from 'express';
import mime from 'mime';

import { packagePath } from './util.mjs';

export default class Serve extends BroccoliPlugin {
  server = null;

  constructor(inputNode, onServerStart) {
    super([inputNode]);

    this.onServerStart = onServerStart;
  }

  build() {
    if (!this.server) {
      this.server = createServer(this.inputPaths[0]);

      this.onServerStart(this.server.app);
    }

    this.server.notify();
  }
}

function createServer(distPath) {
  const app     = express();
  const channel = new EventEmitter();

  app.get('/-reloader', (_req, res) => {
    res.type('text').write(''); // fetch() is not resolved without sending headers

    function notify() {
      res.write('--- changed ---\n');
    }

    channel.on('notify', notify);

    const keepalive = setInterval(() => {
      res.write('--- keepalive ---\n');
    }, 30_000);

    res.on('close', () => {
      channel.off('notify', notify);
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

  return {
    app,

    notify() {
      channel.emit('notify');
    }
  };
}

function injectReloaderClient(html) {
  return html.replace('</head>', '<script src="/-reloader/client" async></script></head>');
}
