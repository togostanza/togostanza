import path from 'path';

import { Command } from 'commander';
import fecha from 'fecha';
import yeoman from 'yeoman-environment';

import StanzaGenerator from '../../generators/stanza/index.mjs';
import {
  ensureTogoStanzaIsLocallyInstalled,
  packagePath,
} from '../../util.mjs';

const command = new Command()
  .command('stanza [id]')
  .description('generate a stanza')
  .option('--label <label>', 'label')
  .option('--definition <definition>', 'definition')
  .option('--license <license>', 'license')
  .option('--author <author>', 'author')
  .option(
    '--timestamp <date>',
    'timestamp',
    fecha.format(new Date(), 'isoDate')
  )
  .action(async (id, opts) => {
    await generateStanza(Object.assign({ id }, opts));
  });

export default command;

async function generateStanza(opts) {
  const repositoryDir = path.resolve('.');

  ensureTogoStanzaIsLocallyInstalled(repositoryDir);

  const env = yeoman.createEnv();

  env.registerStub(
    StanzaGenerator,
    'togostanza:stanza',
    path.join(packagePath, 'src', 'generators', 'stanza', 'index.mjs')
  );

  return env.run('togostanza:stanza', opts);
}
