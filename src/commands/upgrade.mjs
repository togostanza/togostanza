import path from 'path';
import { promisify } from 'util';

import commander from 'commander';
import yeoman from 'yeoman-environment';

import UpgradeGenerator from '../generators/upgrade/index.mjs';
import { packagePath } from '../util.mjs';

const command = new commander.Command()
  .command('upgrade')
  .description('upgrade stanza repository')
  .action(async (opts) => {
    await upgrade(opts);
  });

export default command;

async function upgrade(opts) {
  const env = yeoman.createEnv();

  env.registerStub(UpgradeGenerator, 'togostanza:upgrade', path.join(packagePath, 'src', 'generators', 'upgrade', 'index.mjs'));

  await promisify(env.run.bind(env))('togostanza:upgrade', opts);
}
