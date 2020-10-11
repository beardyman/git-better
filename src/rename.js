const git = require('simple-git/promise')();
const Branch = require('./model/branch');
const { getConfig } = require('./config');

/**
 * Renames a branch to a new name by creating a new branch and deleting the old one.
 *
 * @param {string} newName
 * @param {Object} options
 * @returns {Promise<void>}
 */
async function rename(newName, options = {}) {
  const branches = await git.branch()
  const config = await getConfig();
  const remote = options.remote || config.defaultRemote;

  // does the new name include the namespace?
  // (can't switch namespaces because it would mess up the base if the branch was created from a different base)
  const newBranch = Branch.fromFullBranchName(newName);
  const currentBranch = Branch.fromFullBranchName(branches.current);

  if(newBranch.namespace && newBranch.namespace !== currentBranch.namespace) {
    throw new Error('Cannot rename branch to a new namespace')
  }

  // in case the user didn't pass the namespace
  newBranch.namespace = currentBranch.namespace;

  if (options.logger) {
    options.logger(`Renaming branch ${currentBranch} to ${newBranch}`);
  }

  await git.checkoutBranch(newBranch.toString(), currentBranch.toString());
  await git.deleteLocalBranch(currentBranch.toString());

  if (config.alwaysPush || options.push) {
    await git.push(remote, newBranch.toString());
    await git.push(remote, currentBranch.toString(), {'--delete': undefined});
  }
}

module.exports = rename;
