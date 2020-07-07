import Generator from 'yeoman-generator';
import dedent from 'dedent';

export default class RepositoryGenerator extends Generator {
  async prompting() {
    const {name, license, skipGit, owner, repo, skipInstall, packageManager} = this.options;

    const answers = await this.prompt([
      {
        name:    'name',
        message: 'repository name (used as a directory name)',
        when:    !name
      },
      {
        name:    'license',
        default: 'MIT',
        when:    !license
      },
      {
        name:    'owner',
        message: 'Who is the GitHub owner of repository (https://github.com/OWNER/repo)',
        default: await this.user.github.username(),
        when:    !skipGit && !owner
      },
      {
        name:    'repo',
        message: 'What is the GitHub name of repository (https://github.com/owner/REPO)',
        default: memo => name || memo.name,
        when:    !skipGit && !repo
      },
      {
        name:    'packageManager',
        message: 'Select a package manager',
        type:    'list',
        choices: ['yarn', 'npm'],
        when:    !skipInstall && !packageManager
      }
    ]);

    this.inputs = Object.assign({}, this.options, answers);
  }

  writing() {
    const root = this.destinationRoot(this.inputs.name);

    this.writeDestinationJSON('package.json', packageJSON(this.inputs));

    this.renderTemplate('**/*', '.', this.inputs, null, {
      processDestinationPath: (fullPath) => {
        const relativePath = fullPath.slice(root.length + 1);

        return this.destinationPath(relativePath.replace(/(?<=^|\/)_/g, '.'));
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
      togostanza: 'togostanza/ts#js'
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
      $ ${runner} togostanza new-stanza <ID>

    Serve the repository locally:

      $ cd ${name}
      $ ${runner} togostanza serve

    Building stanzas for deployment:

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
