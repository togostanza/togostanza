import path from 'path';

import yeoman from 'yeoman-environment';

import ProviderGenerator from '../../generators/provider/index.mjs';
import { packagePath} from '../util.mjs';

export default function newProvider(argv, opts) {
  const env = yeoman.createEnv(argv);

  env.registerStub(ProviderGenerator, 'togostanza:provider', path.join(packagePath, 'generators', 'provider', 'index.mjs'));

  env.run('togostanza:provider', opts, (err) => {
    if (err) { throw err; }
  });
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
