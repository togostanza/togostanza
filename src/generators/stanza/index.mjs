import path from 'path';

import Generator from 'yeoman-generator';
import fecha from 'fecha';
import lowerCase from 'lodash.lowercase';
import pick from 'lodash.pick';
import upperFirst from 'lodash.upperfirst';

import MemoryStorage from '../memory-storage.mjs';
import { required } from '../validators.mjs';

export default class StanzaGenerator extends Generator {
  async prompting() {
    const args    = pick(this.options, ['id', 'label', 'definition', 'type', 'context', 'display', 'provider', 'license', 'author', 'address']);
    const storage = new MemoryStorage(args);

    await this.prompt([
      {
        name:     'id',
        message:  'stanza id (<togostanza-ID></togostanza-ID>):',
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

    this.renderTemplate('**/*', '.', this.params, null, {
      processDestinationPath: (fullPath) => {
        const relativePath = fullPath.slice(this.destinationRoot().length + 1);
        const dotted       = relativePath.replace(/(?<=^|\/)_/g, '.');

        return this.destinationPath(this._stanzaDestinationPath(dotted));
      }
    });
  }

  _stanzaDestinationPath(...paths) {
    return path.join('stanzas', this.params.id, ...paths);
  }
};

function metadataJSON({id, label, definition, type, context, display, provider, license, author, address}) {
  const today = fecha.format(new Date(), 'isoDate');

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
    'stanza:usage': `<togostanza-${id}></togostanza-${id}>`,
    'stanza:type': type,
    'stanza:context': context,
    'stanza:display': display,
    'stanza:provider': provider,
    'stanza:license': license,
    'stanza:author': author,
    'stanza:address': address,
    'stanza:contributor': [],
    'stanza:created': today,
    'stanza:updated': today
  };
}
