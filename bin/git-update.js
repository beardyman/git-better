#!/usr/bin/env node

const wrapper = require('./shell-wrapper');
const update = require('../src/update');

wrapper(update);
