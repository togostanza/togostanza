import path from 'path';
import { promisify } from 'util';

import yeoman from 'yeoman-environment';

import StanzaGenerator from '../../generators/stanza/index.mjs';
import { packagePath } from '../util.mjs';

export default async function newStanza(argv, opts) {
  const env = yeoman.createEnv(argv);

  env.registerStub(StanzaGenerator, 'togostanza:stanza', path.join(packagePath, 'generators', 'stanza', 'index.mjs'));

  await promisify(env.run.bind(env))('togostanza:stanza', opts);
}

export const optionDefinition = [
  {name: 'id',         type: String, defaultOption: true},
  {name: 'label',      type: String},
  {name: 'definition', type: String},
  {name: 'type',       type: String},
  {name: 'context',    type: String},
  {name: 'display',    type: String},
  {name: 'provider',   type: String},
  {name: 'license',    type: String},
  {name: 'author',     type: String},
  {name: 'address',    type: String},
];
