import Generator from 'yeoman-generator';
import dedent from 'dedent';

import { required } from '../validators.mjs';

export default class RepositoryGenerator extends Generator {
  async prompting() {
    const {name, license, skipGit, owner, repo, skipInstall, packageManager} = this.options;

    const answers = await this.prompt([
      {
        name:     'name',
        message:  'stanza repository name (used as a directory name):',
        validate: required,
        when:     name === undefined
      },
      {
        name:    'license',
        default: 'MIT',
        when:    license === undefined
      },
      {
        name:     'owner',
        message:  'GitHub repository owner (https://github.com/OWNER/repo):',
        default:  await this.user.github.username(),
        validate: required,
        when:     !skipGit && owner === undefined
      },
      {
        name:     'repo',
        message:  'GitHub repository name (https://github.com/owner/REPO):',
        default:  memo => name || memo.name,
        validate: required,
        when:     !skipGit && repo === undefined
      },
      {
        name:    'packageManager',
        message: 'package manager:',
        type:    'list',
        choices: ['yarn', 'npm'],
        when:    !skipInstall && packageManager === undefined
      }
    ]);

    this.inputs = Object.assign({}, this.options, answers);
  }

  writing() {
    const root   = this.destinationRoot(this.inputs.name);
    const runner = commandRunner(this.inputs.packageManager);

    this.writeDestinationJSON('package.json', packageJSON(this.inputs));

    this.renderTemplate('**/*', '.', Object.assign({}, this.inputs, {commandRunner: runner}), null, {
      processDestinationPath: (fullPath) => {
        const relativePath = fullPath.slice(root.length + 1);
        const dotted       = relativePath.replace(/(?<=^|\/)_/g, '.');

        return this.destinationPath(dotted);
      }
    });
  }

  install() {
    const {skipInstall, packageManager} = this.inputs;

    if (skipInstall) { return; }

    this.installDependencies({
      yarn:  packageManager === 'yarn',
      npm:   packageManager === 'npm',
      bower: false
    });
  }

  end() {
    this._setupGit();

    this.log();
    this.log(gettingStarted(this.inputs));
    this.log();
  }

  _setupGit() {
    const {skipGit, owner, repo, name} = this.inputs;

    if (skipGit) { return; }

    const root = this.destinationRoot();

    this.spawnCommandSync('git', ['-C', root, 'init']);
    this.spawnCommandSync('git', ['-C', root, 'remote', 'add', 'origin', `https://github.com/${owner}/${repo}.git`]);
    this.spawnCommandSync('git', ['-C', root, 'add', '--all']);
    this.spawnCommandSync('git', ['-C', root, 'commit', '--message', `Initialize new stanza repository: ${name}`]);
  }
};

function packageJSON({name, license, skipGit, owner, repo}) {
  return {
    name,
    version: '0.0.1',
    license,
    repository: skipGit ? '' : `${owner}/${repo}`,
    scripts: {
      start:        'togostanza serve --port $npm_package_config_port',
      build:        'togostanza build',
      'new-stanza': 'togostanza new-stanza'
    },
    config: {
      port: 8080
    },
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
  const runner = commandRunner(packageManager);

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

function commandRunner(packageManager) {
  switch (packageManager) {
    case 'yarn':
      return 'yarn run';
    case 'npm':
      return 'npx';
    default:
      throw new Error(`unknown package manager: ${packageManager}`);
  }
}
