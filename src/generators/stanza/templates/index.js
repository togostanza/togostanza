export default async function <%= camelCase(id) %>(stanza, params) {
  const sayTo = params['say-to'] || 'world';

  stanza.render({
    template: 'stanza.html.hbs',
    parameters: {
      greeting: `Hello, ${sayTo}!`
    }
  });
}
