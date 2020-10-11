#!/usr/bin/env node

const wrapper = require('./shell-wrapper');

wrapper((argv) => {
  console.log(argv);
})
