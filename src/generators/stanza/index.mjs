import path from 'path';

import Generator from 'yeoman-generator';
import camelCase from 'lodash.camelcase';
import kebabCase from 'lodash.kebabcase';
import lowerCase from 'lodash.lowercase';
import pick from 'lodash.pick';
import upperFirst from 'lodash.upperfirst';

import MemoryStorage from '../memory-storage.mjs';
import { required } from '../validators.mjs';

export default class StanzaGenerator extends Generator {
  async prompting() {
    const args = pick(this.options, [
      'id',
      'label',
      'definition',
      'license',
      'author',
      'timestamp',
    ]);
    const storage = new MemoryStorage(args);

    await this.prompt(
      [
        {
          name: 'id',
          message: 'stanza id (<togostanza-ID>):',
          validate: required,
          filter: (input) => kebabCase(input),
        },
        {
          name: 'label',
          default: ({ id }) => upperFirst(lowerCase(args.id || id)),
          validate: required,
        },
        {
          name: 'definition',
          message: 'definition (description):',
        },
        {
          name: 'license',
          default: 'MIT', // TODO read package.json?
        },
        {
          name: 'author',
          default: this.user.git.name(),
        },
      ],
      storage
    );

    this.params = { ...storage.data, id: kebabCase(storage.data.id) };
  }

  writing() {
    this.writeDestinationJSON(
      this._stanzaDestinationPath('metadata.json'),
      metadataJSON(this.params)
    );

    const pascalCase = (str) => upperFirst(camelCase(str));

    const templateParams = { ...this.params, pascalCase };

    const copyOptions = {
      processDestinationPath: (fullPath) => {
        const relativePath = fullPath.slice(this.destinationRoot().length + 1);
        const dotted = relativePath.replace(/(?<=^|\/)_/g, '.');

        return this.destinationPath(this._stanzaDestinationPath(dotted));
      },

      globOptions: {
        dot: true,
      },
    };

    this.renderTemplate('**/*', '.', templateParams, null, copyOptions);
  }

  _stanzaDestinationPath(...paths) {
    return path.join('stanzas', this.params.id, ...paths);
  }
}

function metadataJSON({
  id,
  label,
  definition,
  license,
  author,
  timestamp,
}) {
  return {
    '@context': {
      stanza: 'http://togostanza.org/resource/stanza#',
    },
    '@id': id,
    'stanza:label': label,
    'stanza:definition': definition,
    'stanza:license': license,
    'stanza:author': author,
    'stanza:contributor': [],
    'stanza:created': timestamp,
    'stanza:updated': timestamp,
    'stanza:parameter': [
      {
        'stanza:key': 'say-to',
        'stanza:type': 'string',
        'stanza:example': 'world',
        'stanza:description': 'who to say hello to',
        'stanza:required': false,
      },
    ],
    'stanza:menu-placement': 'bottom-right',
    'stanza:style': [
      {
        'stanza:key': '--greeting-color',
        'stanza:type': 'color',
        'stanza:default': '#eb7900',
        'stanza:description': 'text color of greeting',
      },
      {
        'stanza:key': '--greeting-align',
        'stanza:type': 'single-choice',
        'stanza:choice': ['left', 'center', 'right'],
        'stanza:default': 'center',
        'stanza:description': 'text align of greeting',
      },
    ],
    'stanza:incomingEvent': [],
    'stanza:outgoingEvent': [],
  };
}
