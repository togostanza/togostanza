#!/usr/bin/env node

import commandLineArgs from 'command-line-args';
import commandLineCommands from 'command-line-commands';

const {command, argv} = commandLineCommands([
  null,
  'serve',
  'build',
  'new-stanza',
  'init',
]);

if (command === null) {
  console.error('togostanza <serve|build|new-stanza|init>')
  process.exit(1);
}

import(`../src/commands/${command}.mjs`).then(async ({default: run, optionDefinition}) => {
  const options = commandLineArgs(optionDefinition, {argv, camelCase: true});

  await run(argv, options);
});
