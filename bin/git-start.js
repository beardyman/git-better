#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));

require('../src/start')(argv).then(()=>{
  process.exit(0);
})