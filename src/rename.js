const git = require('simple-git/promise')();
const Branch = require('./model/branch');

/**
 * Renames a branch to a new name by creating a new branch and deleting the old one.
 *
 * @param newName
 * @param opts
 * @returns {Promise<void>}
 */
async function rename(newName, opts = {}) {
  const branches = await git.branch()

  // does the new name include the namespace?
  // (can't switch namespaces because it would mess up the base if the branch was created from a different base)
  const newBranch = Branch.fromFullBranchName(newName);
  const currentBranch = Branch.fromFullBranchName(branches.current);

  if(newBranch.namespace && newBranch.namespace !== currentBranch.namespace) {
    throw new Error('Cannot rename branch to a new namespace')
  }

  // in case the user didn't pass the namespace
  newBranch.namespace = currentBranch.namespace;

  console.log(`Renaming branch ${currentBranch} to ${newBranch}`);

  await git.checkoutBranch(newBranch.toString(), currentBranch.toString());
  await git.deleteLocalBranch(currentBranch.toString());

  if (opts.push) {
    await git.push('origin', newBranch.toString())
    await git.push('origin', currentBranch.toString(), {'--delete': currentBranch.toString()})
  }
}

module.exports = rename;