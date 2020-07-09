#!/usr/bin/env node

import path from 'path';
import { readFileSync } from 'fs';

import commander from 'commander';

import build from '../src/commands/build.mjs';
import generate from '../src/commands/generate.mjs';
import init from '../src/commands/init.mjs';
import serve from '../src/commands/serve.mjs';
import upgrade from '../src/commands/upgrade.mjs';
import { packagePath } from '../src/util.mjs';

const {program} = commander;
const {version} = JSON.parse(readFileSync(path.join(packagePath, 'package.json')));

program.version(version);

program.addCommand(serve);
program.addCommand(build);
program.addCommand(generate);
program.addCommand(init);
program.addCommand(upgrade);

program.parseAsync(process.argv);
