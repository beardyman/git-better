#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const Branch = require('../src/model/branch');

require('../src/start')().then(()=>{
  process.exit(0);
})