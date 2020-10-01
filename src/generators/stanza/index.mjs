import path from 'path';

import Generator from 'yeoman-generator';
import camelCase from 'lodash.camelcase';
import fs from 'fs-extra';
import lowerCase from 'lodash.lowercase';
import pick from 'lodash.pick';
import upperFirst from 'lodash.upperfirst';

import MemoryStorage from '../memory-storage.mjs';
import { required } from '../validators.mjs';

export default class StanzaGenerator extends Generator {
  async prompting() {
    const args    = pick(this.options, ['id', 'label', 'definition', 'type', 'context', 'display', 'provider', 'license', 'author', 'address', 'timestamp']);
    const storage = new MemoryStorage(args);

    await this.prompt([
      {
        name:     'id',
        message:  'stanza id (<togostanza-ID>):',
        validate: required
      },
      {
        name:     'label',
        default:  ({id}) => upperFirst(lowerCase(args.id || id)),
        validate: required
      },
      {
        name:    'definition',
        message: 'definition (description):',
      },
      {
        name: 'type',
        type: 'list',
        choices: [
          'Stanza',
          'NanoStanza',
          {name: 'Other (free form)', value: null}
        ]
      },
      {
        name: 'type',
        when: ({type}) => type === null,
        askAnswered: true
      },
      {
        name: 'context',
        type: 'list',
        choices: [
          'Environment',
          'Gene',
          'Organism',
          'Phenotype',
          {name: 'Other (free form)', value: null}
        ]
      },
      {
        name: 'context',
        when: ({context}) => context === null,
        askAnswered: true
      },
      {
        name: 'display',
        type: 'list',
        choices: [
          'Text',
          'Numeral',
          'Table',
          'Chart',
          'Tree',
          'Graph',
          'Map',
          'Image',
          {name: 'Other (free form)', value: null}
        ],
        pageSize: Infinity
      },
      {
        name: 'display',
        when: ({display}) => display === null,
        askAnswered: true
      },
      {
        name: 'provider'
      },
      {
        name:    'license',
        default: 'MIT' // TODO read package.json?
      },
      {
        name:    'author',
        default: this.user.git.name()
      },
      {
        name:    'address',
        default: this.user.git.email()
      }
    ], storage);

    this.params = storage.data;
  }

  writing() {
    this.writeDestinationJSON(this._stanzaDestinationPath('metadata.json'), metadataJSON(this.params));

    this.renderTemplate('**/*', '.', {...this.params, camelCase}, null, {
      processDestinationPath: (fullPath) => {
        const relativePath = fullPath.slice(this.destinationRoot().length + 1);
        const dotted       = relativePath.replace(/(?<=^|\/)_/g, '.');

        return this.destinationPath(this._stanzaDestinationPath(dotted));
      }
    });
  }

  async end() {
    await fs.mkdirs(this._stanzaDestinationPath('lib'));
  }

  _stanzaDestinationPath(...paths) {
    return path.join('stanzas', this.params.id, ...paths);
  }
};

function metadataJSON({id, label, definition, type, context, display, provider, license, author, address, timestamp}) {
  return {
    '@context': {
      stanza: 'http://togostanza.org/resource/stanza#'
    },
    '@id': id,
    'stanza:label': label,
    'stanza:definition': definition,
    'stanza:parameter': [
      {
        'stanza:key': 'say-to',
        'stanza:example': 'world',
        'stanza:description': 'who to say hello to',
        'stanza:required': false
      }
    ],
    'stanza:about-link-placement': 'bottom-right',
    'stanza:style': [
      {
        'stanza:key': '--greeting-color',
        'stanza:type': 'color',
        'stanza:default': '#000',
        'stanza:description': 'text color of greeting'
      },
      {
        'stanza:key': '--greeting-align',
        'stanza:type': 'single-choice',
        'stanza:choice': [
          'left',
          'center',
          'right'
        ],
        'stanza:default': 'center',
        'stanza:description': 'text align of greeting'
      },
    ],
    'stanza:usage': `<togostanza-${id}></togostanza-${id}>`,
    'stanza:type': type,
    'stanza:context': context,
    'stanza:display': display,
    'stanza:provider': provider,
    'stanza:license': license,
    'stanza:author': author,
    'stanza:address': address,
    'stanza:contributor': [],
    'stanza:created': timestamp,
    'stanza:updated': timestamp
  };
}
