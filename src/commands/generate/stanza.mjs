import path from 'path';
import { promisify } from 'util';

import commander from 'commander';
import yeoman from 'yeoman-environment';

import StanzaGenerator from '../../generators/stanza/index.mjs';
import { packagePath } from '../../util.mjs';

const command = new commander.Command()
  .command('stanza [id]')
  .description('generate a stanza')
  .option('--label <label>',           'label')
  .option('--definition <definition>', 'definition')
  .option('--type <type>',             'type')
  .option('--context <context>',       'context')
  .option('--display <display>',       'display')
  .option('--provider <provider>',     'provider')
  .option('--license <license>',       'license')
  .option('--author <author>',         'author')
  .option('--address <address>',       'address')
  .action(async (id, opts) => {
    await generateStanza(Object.assign({id}, opts));
  });

export default command;

async function generateStanza(opts) {
  const env = yeoman.createEnv();

  env.registerStub(StanzaGenerator, 'togostanza:stanza', path.join(packagePath, 'src', 'generators', 'stanza', 'index.mjs'));

  await promisify(env.run.bind(env))('togostanza:stanza', opts);
}

