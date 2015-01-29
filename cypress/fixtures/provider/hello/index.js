import Stanza from "stanza";
import metadata from "./metadata.json";

Stanza(metadata, function (stanza, params) {
  stanza.render({
    template: "stanza.html",
    parameters: {
      greeting: "Hello, world!",
    },
  });
});
