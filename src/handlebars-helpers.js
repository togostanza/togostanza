export default function (Handlebars) {
  Handlebars.registerHelper('eq', (a, b) => a === b);
  Handlebars.registerHelper('and', (a, b) => a && b);
}
