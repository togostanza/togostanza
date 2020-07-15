import path from 'path';
import fs from 'fs-extra';

import Generator from 'yeoman-generator';
import walkSync from 'walk-sync';
import chalk from 'chalk';

export default class UpgradeGenerator extends Generator {
  async writing() {
    this._moveStanzaIntoStanzas();
  }

  // In order to suppress undesired conflicts on file/dir moves, move stanzas directly in writing phase instead of yeoman's actions/fs use.
  async _moveStanzaIntoStanzas() {
    const metadataPaths = walkSync('.', {
      globs: ['*/metadata.json']
    });

    await Promise.all(metadataPaths.map(async (metadataPath) => {
      const from = path.dirname(metadataPath);
      const to   = path.join('stanzas', from);

      await fs.move(from, to);

      this.log.write(chalk.green('move') + `  ${from} -> ${to}\n`);
    }));
  }
}
