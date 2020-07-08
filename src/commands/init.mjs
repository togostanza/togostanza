import path from 'path';
import { promisify } from 'util';

import yeoman from 'yeoman-environment';

import RepositoryGenerator from '../../generators/repository/index.mjs';
import { packagePath } from '../util.mjs';

export default async function newRepository(argv, opts) {
  const env = yeoman.createEnv(argv);

  env.registerStub(RepositoryGenerator, 'togostanza:repository', path.join(packagePath, 'generators', 'repository', 'index.mjs'));

  await promisify(env.run.bind(env))('togostanza:repository', opts);
}

export const optionDefinition = [
  {name: 'name',            type: String, defaultOption: true},
  {name: 'license',         type: String},
  {name: 'owner',           type: String},
  {name: 'repo',            type: String},
  {name: 'package-manager', type: String},
  {name: 'skip-install',    type: Boolean, defaultValue: false},
  {name: 'skip-git',        type: Boolean, defaultValue: false},
];
