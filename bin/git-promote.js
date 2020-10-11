#!/usr/bin/env node

const wrapper = require('./shell-wrapper');
const promote = require('../src/promote');

wrapper((argv) => {
  return promote({logger: console.log, ...argv});
})
