#!/usr/bin/env node

const wrapper = require('./shell-wrapper');
// const config = require('../src/config');

wrapper((argv) => {
  // return config({logger: console.log, ...argv});
})
