import path from 'path';
import { promises as fs } from 'fs';

import BroccoliPlugin from 'broccoli-plugin';

import StanzaRepository from './stanza-repository.mjs';
import { handlebarsTemplate, packagePath } from './util.mjs';

export default class BuildStanza extends BroccoliPlugin {
  constructor(inputNode, options) {
    super([inputNode], options);

    this.environment = options.environment;
  }

  async build() {
    const stanzas = new StanzaRepository(this.inputPaths[0]).allStanzas;

    await this.buildStanzas(stanzas);
  }

  async buildStanzas(stanzas) {
    const entrypointTemplate = await handlebarsTemplate(path.join(packagePath, 'src', 'entrypoint.js.hbs'), {noEscape: true});

    await Promise.all(stanzas.map(stanza => this.buildStanza(stanza, entrypointTemplate)));
  }

  async buildStanza(stanza, entrypointTemplate) {
    const metadata = await stanza.metadata;
    const readme   = await stanza.readme;

    this.output.writeFileSync(`${stanza.id}.js`, entrypointTemplate({
      metadata,
      templates: await stanza.templates,
      outer:     await stanza.outer
    }));

    this.output.mkdirSync(stanza.id);
    await fs.copyFile(stanza.scriptPath, path.join(this.outputPath, stanza.id, 'index.js'));
  }
}
