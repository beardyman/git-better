#!/usr/bin/env node

const wrapper = require('./shell-wrapper');
const start = require('../src/start');
const Branch = require('../src/model/branch');

wrapper((argv) =>

  // extract the branch name and pass it to the script
  start(Branch.fromFullBranchName(argv._.join('/')), {logger: console.log, ...argv})
);
