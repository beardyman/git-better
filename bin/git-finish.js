#!/usr/bin/env node

const wrapper = require('./shell-wrapper');
const finish = require('../src/finish');

wrapper((argv) => {
  return finish({logger: console.log, ...argv});
})
