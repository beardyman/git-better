#!/usr/bin/env node

const wrapper = require('./shell-wrapper');
const update = require('../src/pr');

wrapper((argv) => update({logger: console.log, ...argv}));
