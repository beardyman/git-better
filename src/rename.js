const git = require('simple-git/promise')();
const utils = require('../src/utils');

async function rename(newName) {
  const branches = await git.branch()
  console.log(branches);

  // does the new name include the namespace?
  // (can't switch namespaces because it would mess up the base if the branch was created from a different base)
  const newBranch = utils.parseBranch(newName);
  const currentBranch = utils.parseBranch(branches.current)

  console.log(newBranch, currentBranch);

  console.log(`Renaming ${branches.current} to ${newName}`);
}

module.exports = rename;