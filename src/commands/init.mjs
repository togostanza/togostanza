import path from 'path';
import { promisify } from 'util';

import { Command } from 'commander';
import yeoman from 'yeoman-environment';

import RepositoryGenerator from '../generators/repository/index.mjs';
import { packagePath } from '../util.mjs';

const command = new Command()
  .command('init')
  .description('create a new stanza repository')
  .option('--git-url <url>', 'Git repository URL')
  .option('--name <name>', 'stanza repository name')
  .option('--license <license>', 'license')
  .option('--package-manager <npm|yarn>', 'package manager')
  .option('--skip-install', 'skip package installation')
  .option('--skip-git', 'skip Git configuration')
  .action(init);

export default command;

async function init(opts) {
  const env = yeoman.createEnv();

  env.registerStub(
    RepositoryGenerator,
    'togostanza:repository',
    path.join(packagePath, 'src', 'generators', 'repository', 'index.mjs')
  );

  await promisify(env.run.bind(env))('togostanza:repository', opts);
}
