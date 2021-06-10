import Stanza from 'togostanza/stanza';

export default class <%= camelCase(id) %> extends Stanza {
  async render() {
    this.renderTemplate(
      'stanza.html.hbs',
      {
        parameters: {
          greeting: `Hello, ${this.params['say-to']}!`
        }
      }
    );
  }
}
