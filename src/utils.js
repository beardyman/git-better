
const git = require('simple-git/promise')();
const utils = {};

utils.isClean = async ()=>{
  const res = await git.status();
  return res.modified.length === 0;
}

module.exports = utils;