import path from 'path';

import Generator from 'yeoman-generator';
import outdent from 'outdent';
import fs from 'fs-extra';
import pick from 'lodash.pick';

import MemoryStorage from '../memory-storage.mjs';
import { packagePath } from '../../util.mjs';
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

function errorOfGitUrl(url) {
  if (!url) {
    return null;
  }
  try {
    new URL(canonifyGitUrl(url));
  } catch (e) {
    if (e.code === 'ERR_INVALID_URL') {
      return `${url} is not valid as repository URL`;
    } else {
      throw e;
    }
  }
  return null;
}

export function canonifyGitUrl(url) {
  try {
    new URL(url)
  } catch (e) {
    if (e.code !== 'ERR_INVALID_URL') {
      throw e;
    }
    const m = url.match(/^([^:]+):(.+)$/);
    if (!m) {
      return url;
    }
    return `ssh://${m[1]}/${m[2]}`;
  }
  return url;
}

export function errorOfRepositoryName(name) {
  return /^[\da-z][\da-z\._-]*$/i.test(name) ? null : `${name} is not valid repository name`;
}

export async function errorOfRepositoryPathExistence(dest) {
  return await fs.pathExists(dest) ? `destination path already exists: ${dest}` : null;
}

export function getHttpsRepositoryUrlIfPossible(url) {
  let gitUrl;
  try {
    gitUrl = new URL(canonifyGitUrl(url));
  } catch (e) {
    return url;
  }

  if (gitUrl.protocol === 'ssh:' && gitUrl.host === 'github.com') {
    return `https://${gitUrl.host}${gitUrl.pathname}`
  }

  return url;
}

export default class RepositoryGenerator extends Generator {
  async prompting() {
    const args    = pick(this.options, ['gitUrl', 'name', 'license', 'packageManager', 'skipGit']);
    const storage = new MemoryStorage(args);

    await this.prompt([
      {
        name:    'gitUrl',
        message: 'Git repository URL (leave blank if you don\'t need to push to a remote Git repository):',

        validate(val) {
          if (!val) { return true; }

          return errorOfGitUrl(val) || true;
        }
      },
      {
        name:    'name',
        message: 'stanza repository name (used as a directory name):',

        default({gitUrl}) {
          if (!gitUrl) { return null; }

          const path = new URL(canonifyGitUrl(gitUrl)).pathname;
          const name = path.split('/').slice(-1)[0].replace(/\.git$/, '');

          return errorOfRepositoryName(name) ? null : name;
        },

        validate: async (val) => {
          const result = required(val);

          if (result !== true) { return result; }

          const error = errorOfRepositoryName(val);
          if (error) {
            return error;
          }

          const dest = this.destinationPath(val);

          return await errorOfRepositoryPathExistence(dest) || true;
        }
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
      }
    ], storage);

    this.params = storage.data;
  }

  async writing() {
    const {skipGit, gitUrl, name, packageManager} = this.params;

    const dest = this.destinationPath(name);

    const errors = [
      errorOfGitUrl(gitUrl),
      errorOfRepositoryName(name),
      await errorOfRepositoryPathExistence(dest)
    ];

    for (const e of errors) {
      if (!e) { continue; }

      this.log.error(e);
      process.exit(1);
    }

    const commands = packageManagers[packageManager];

    this.destinationRoot(name);
    this._gitPrepare({skipGit, gitUrl, dest});
    this.writeDestinationJSON('package.json', packageJSON(this.params));

    const templateParams = {...this.params, commands};

    const copyOptions = {
      processDestinationPath: (fullPath) => {
        const relativePath = fullPath.slice(dest.length + 1);
        const dotted       = relativePath.replace(/(?<=^|\/)_/g, '.');

        return this.destinationPath(dotted);
      },

      globOptions: {
        dot: true
      }
    };

    this.renderTemplate('**/*', '.', templateParams, null, copyOptions);
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
    const {skipGit, name} = this.params;

    this._gitCommit({skipGit, name, dest: this.destinationPath()});

    this.log();
    this.log(gettingStarted(this.params));
    this.log();
  }

  _gitPrepare({skipGit, gitUrl, dest}) {
    if (skipGit) { return; }

    if (gitUrl) {
      this.spawnCommandSync('git', ['clone', gitUrl, dest]);
    } else {
      this.spawnCommandSync('git', ['-C', dest, 'init']);
    }
  }

  _gitCommit({skipGit, name, dest}) {
    if (skipGit) { return; }

    this.spawnCommandSync('git', ['-C', dest, 'init']);
    this.spawnCommandSync('git', ['-C', dest, 'add', '--all']);
    this.spawnCommandSync('git', ['-C', dest, 'commit', '--message', `Initialize new stanza repository: ${name}`]);
  }
};

const {version} = JSON.parse(fs.readFileSync(path.join(packagePath, 'package.json')));

function packageJSON({name, license, gitUrl}) {

  return {
    name,
    version: '0.0.1',
    license,
    repository: getHttpsRepositoryUrlIfPossible(gitUrl) || '',
    dependencies: {
      togostanza: `^${version}`
    },
    engines: {
      node: '>=14'
    },
    private: true
  };
}

function gettingStarted({name, packageManager}) {
  const {runner} = packageManagers[packageManager];

  return outdent`
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
