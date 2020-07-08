import Generator from 'yeoman-generator';
import fecha from 'fecha';
import lowerCase from 'lodash.lowercase';
import upperFirst from 'lodash.upperfirst';

import { required } from '../util.mjs';

export default class StanzaGenerator extends Generator {
  async prompting() {
    const {id, label, definition, type, context, display, provider, license, author, address} = this.options;

    const answers = await this.prompt([
      {
        name:     'id',
        message:  'stanza id (<togostanza-ID></togostanza-ID>)',
        validate: required,
        when:     id === undefined
      },
      {
        name:     'label',
        default:  (memo) => upperFirst(lowerCase(id || memo.id)),
        validate: required,
        when:     label === undefined
      },
      {
        name:    'definition',
        message: 'definition (description)',
        when:    definition === undefined
      },
      {
        name: 'type',
        type: 'list',
        choices: [
          'Stanza',
          'NanoStanza',
          {name: 'Other (free form)', value: null}
        ],
        when: type === undefined
      },
      {
        name: 'type',
        when: (memo) => type === undefined && memo.type === null,
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
        ],
        when: context === undefined
      },
      {
        name: 'context',
        when: (memo) => context === undefined && memo.context === null,
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
        pageSize: Infinity,
        when: display === undefined
      },
      {
        name: 'display',
        when: (memo) => display === undefined && memo.display === null,
        askAnswered: true
      },
      {
        name: 'provider',
        when: provider === undefined
      },
      {
        name:    'license',
        default: 'MIT', // TODO read package.json?
        when:    license === undefined
      },
      {
        name:    'author',
        default: this.user.git.name(),
        when:    author === undefined
      },
      {
        name:    'address',
        default: this.user.git.email(),
        when:    address === undefined
      }
    ]);

    this.inputs = Object.assign({}, this.options, answers);
  }

  writing() {
    const root = this.destinationRoot(this.inputs.id);

    this.writeDestinationJSON('metadata.json', metadataJSON(this.inputs));

    this.renderTemplate('**/*', '.', this.inputs, null, {
      processDestinationPath: (fullPath) => {
        const relativePath = fullPath.slice(root.length + 1);

        return this.destinationPath(relativePath.replace(/(?<=^|\/)_/g, '.'));
      }
    });
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
