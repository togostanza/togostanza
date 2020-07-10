import path from 'path';
import { promisify } from 'util';

import commander from 'commander';
import yeoman from 'yeoman-environment';

import RepositoryGenerator from '../generators/repository/index.mjs';
import { packagePath } from '../util.mjs';

const command = new commander.Command()
  .command('init [name]')
  .description('create a new stanza repository')
  .option('--license <license>',          'license')
  .option('--package-manager <npm|yarn>', 'package manager')
  .option('--owner <owner>',              'GitHub owner')
  .option('--repo <repo>',                'GitHub repository name')
  .option('--skip-install',               'skip package installation')
  .option('--skip-git',                   'skip Git configuration')
  .action(async (name, opts) => {
    await init(Object.assign({name}, opts));
  });

export default command;

async function init(opts) {
  const env = yeoman.createEnv();

  env.registerStub(RepositoryGenerator, 'togostanza:repository', path.join(packagePath, 'src', 'generators', 'repository', 'index.mjs'));

  await promisify(env.run.bind(env))('togostanza:repository', opts);
}
