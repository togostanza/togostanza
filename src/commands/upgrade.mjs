import path from 'path';

import chalk from 'chalk';
import commander from 'commander';
import fs from 'fs-extra';
import walkSync from 'walk-sync';

const command = new commander.Command()
  .command('upgrade')
  .description('upgrade stanza repository')
  .action(async (opts) => {
    await moveStanzaIntoStanzas();
  });

export default command;

async function moveStanzaIntoStanzas() {
  const metadataPaths = walkSync('.', {
    globs: ['*/metadata.json']
  });

  await Promise.all(metadataPaths.map(async (metadataPath) => {
    const from = path.dirname(metadataPath);
    const to   = path.join('stanzas', from);

    await fs.move(from, to);

    console.log(chalk.green('move') + `  ${from} -> ${to}\n`);
  }));
}
