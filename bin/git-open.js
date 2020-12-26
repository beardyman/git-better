#!/usr/bin/env node

const wrapper = require('./shell-wrapper');
const open = require('../src/open');

wrapper((argv) => open({logger: console.log, ...argv}));
