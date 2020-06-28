#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));

require('../src/rename')(argv._[0]).then(()=>{
  process.exit(0);
})