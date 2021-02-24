export default function (Handlebars) {
  Handlebars.registerHelper("eq", function (a, b) {
    return a === b;
  });
}
