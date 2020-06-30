const git = require('simple-git/promise')();
const Branch = require('./model/branch');

async function rename(newName, opts = {}) {
  const branches = await git.branch()

  // does the new name include the namespace?
  // (can't switch namespaces because it would mess up the base if the branch was created from a different base)
  const newBranch = new Branch(newName);
  const currentBranch = new Branch(branches.current);

  if(newBranch.namespace && newBranch.namespace !== currentBranch.namespace) {
    throw new Error('Cannot rename to a new namespace')
  }

  newBranch.namespace = currentBranch.namespace;

  console.log(`Renaming ${currentBranch} to ${newBranch}`);

  await git.checkoutBranch(newBranch.toString(), currentBranch.toString());
  await git.deleteLocalBranch(currentBranch.toString());

  if (opts.push) {
    await git.push('origin', undefined, {'--delete': currentBranch.toString()})
  }
}

module.exports = rename;