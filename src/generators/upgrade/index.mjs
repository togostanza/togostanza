import path from 'path';

import Generator from 'yeoman-generator';
import walkSync from 'walk-sync';

export default class UpgradeGenerator extends Generator {
  writing() {
    const paths = walkSync('.', {
      globs: ['*/metadata.json']
    });

    for (const _path of paths) {
      const dirname = path.dirname(_path);

      // TODO hide conflicts
      this.moveDestination(dirname, path.join('stanzas', dirname));
    }
  }
}
