#!/usr/bin/env node

const wrapper = require('./shell-wrapper');
const config = require('../src/config');

/**
 * git wf-init [-g|--global] hotfix
 * Takes the name of an example to copy into the user's home directory or
 */
wrapper((argv) => config.initialize(argv._[0], {logger: console.log, ...argv}), {});
