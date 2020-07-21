export default function <%= camelCase(id) %>(stanza, params) {
  const sayTo = params['say-to'] || 'world';

  stanza.render({
    template: 'stanza.html',
    parameters: {
      greeting: `Hello, ${sayTo}!`
    }
  });
}
