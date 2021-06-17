import Stanza from 'togostanza/stanza';

export default class <%= pascalCase(id) %> extends Stanza {
  async render() {
    this.renderTemplate(
      {
        template: 'stanza.html.hbs',
        parameters: {
          greeting: `Hello, ${this.params['say-to']}!`
        }
      }
    );
  }
}
