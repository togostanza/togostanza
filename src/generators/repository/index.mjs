import Generator from 'yeoman-generator';
import dedent from 'dedent';
import fs from 'fs-extra';
import pick from 'lodash.pick';

import MemoryStorage from '../memory-storage.mjs';
import { required } from '../validators.mjs';

const packageManagers = {
  npm: {
    install: 'npm ci',
    runner:  'npx'
  },
  yarn: {
    install: 'yarn install --frozen-lockfile',
    runner:  'yarn run'
  }
};

export default class RepositoryGenerator extends Generator {
  async prompting() {
    const args    = pick(this.options, ['name', 'license', 'packageManager', 'skipGit', 'owner', 'repo']);
    const storage = new MemoryStorage(args);

    await this.prompt([
      {
        name:     'name',
        message:  'stanza repository name (used as a directory name):',
        validate: required
      },
      {
        name:    'license',
        default: 'MIT'
      },
      {
        name:    'packageManager',
        message: 'package manager:',
        type:    'list',
        choices: Object.keys(packageManagers)
      },
      {
        name:    'owner',
        message: 'GitHub repository owner (https://github.com/OWNER/repo):',
        default: () => this.user.github.username(),
      },
      {
        name:    'repo',
        message: 'GitHub repository name (https://github.com/owner/REPO):',
        default: ({name})  => args.name  || name,
        when:    ({owner}) => args.owner || owner
      }
    ], storage);

    this.params = storage.data;
  }

  writing() {
    const {name, packageManager} = this.params;

    const root     = this.destinationRoot(name);
    const commands = packageManagers[packageManager];

    this.writeDestinationJSON('package.json', packageJSON(this.params));

    this.renderTemplate('**/*', '.', Object.assign({}, this.params, {commands}), null, {
      processDestinationPath: (fullPath) => {
        const relativePath = fullPath.slice(root.length + 1);
        const dotted       = relativePath.replace(/(?<=^|\/)_/g, '.');

        return this.destinationPath(dotted);
      }
    });
  }

  install() {
    const {skipInstall, packageManager} = this.params;

    if (skipInstall) { return; }

    this.installDependencies({
      yarn:  packageManager === 'yarn',
      npm:   packageManager === 'npm',
      bower: false
    });
  }

  async end() {
    await fs.mkdirs('lib');

    this._setupGit();

    this.log();
    this.log(gettingStarted(this.params));
    this.log();
  }

  _setupGit() {
    const {skipGit, name, owner, repo} = this.params;

    if (skipGit) { return; }

    const root = this.destinationRoot();

    this.spawnCommandSync('git', ['-C', root, 'init']);
    this.spawnCommandSync('git', ['-C', root, 'add', '--all']);
    this.spawnCommandSync('git', ['-C', root, 'commit', '--message', `Initialize new stanza repository: ${name}`]);

    if (owner && repo) {
      this.spawnCommandSync('git', ['-C', root, 'remote', 'add', 'origin', `https://github.com/${owner}/${repo}.git`]);
    }
  }
};

function packageJSON({name, license, owner, repo}) {
  return {
    name,
    version: '0.0.1',
    license,
    repository: owner && repo ? `${owner}/${repo}` : '',
    dependencies: {
      togostanza: 'togostanza/togostanza-js'
    },
    engines: {
      node: '>=12'
    },
    private: true
  };
}

function gettingStarted({name, packageManager}) {
  const {runner} = packageManagers[packageManager];

  return dedent`
    Getting Started
    ---------------

    Create a new stanza:

      $ cd ${name}
      $ ${runner} togostanza generate stanza

    Serve the repository locally:

      $ cd ${name}
      $ ${runner} togostanza serve

    Build stanzas for deployment:

      $ cd ${name}
      $ ${runner} togostanza build
  `;
}
