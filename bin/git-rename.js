#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));

require('../src/rename')(argv._[0], argv).then(()=>{
  process.exit(0);
})