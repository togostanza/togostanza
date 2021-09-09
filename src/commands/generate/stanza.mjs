import path from 'path';
import { promisify } from 'util';

import commander from 'commander';
import fecha from 'fecha';
import yeoman from 'yeoman-environment';

import StanzaGenerator from '../../generators/stanza/index.mjs';
import {
  ensureTogoStanzaIsLocallyInstalled,
  packagePath,
} from '../../util.mjs';

const command = new commander.Command()
  .command('stanza [id]')
  .description('generate a stanza')
  .option('--label <label>', 'label')
  .option('--definition <definition>', 'definition')
  .option('--type <type>', 'type')
  .option('--provider <provider>', 'provider')
  .option('--license <license>', 'license')
  .option('--author <author>', 'author')
  .option('--address <address>', 'address')
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

  await promisify(env.run.bind(env))('togostanza:stanza', opts);
}
