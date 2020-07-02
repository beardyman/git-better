#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));

require('../src/finish')()
  .then(()=>{
    process.exit(0);
  }).catch((err) =>{
    console.log(err.message);
    process.exit(255);
  });