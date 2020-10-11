#!/usr/bin/env node

const wrapper = require('./shell-wrapper');
const rename = require('../src/rename');

wrapper((argv) => {

  // get the new branch name and pass the options
  return rename(argv._[0], argv);
})
