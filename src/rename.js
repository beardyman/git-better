const git = require('simple-git/promise')();
const Branch = require('./model/branch');
const { getConfig } = require('./config');
const utils = require('./utils');

/**
 * Compares namespaces
 *
 * @param {Branch} newBranch - the incoming new branch
 * @param {Branch} currentBranch - the users current branch
 * @returns {boolean} true if namespaces are the same
 */
const sameNamepace = (newBranch, currentBranch) =>
  newBranch.namespace && newBranch.namespace !== currentBranch.namespace;

/**
 * Renames a branch to a new name by creating a new branch and deleting the old one.
 *
 * @param {string} newName - the new branch name
 * @param {Object} [options] - any options required, most options can have set defaults in config
 * @param {string} [options.remote] - a specified remote to push to. Only valid when the push option is also true
 * @param {Object} [options.logger] - a logger to report the status to the user
 * @param {boolean} [options.push] - should it be pushed to the remote or not
 *
 * @returns {Promise<void>} - resolves when complete
 */
async function rename(newName, options = {}) {
  const branches = await git.branch();
  const config = await getConfig();
  const remote = utils.getRemote(config, options);

  // does the new name include the namespace?
  // (can't switch namespaces because it would mess up the base if the branch was created from a different base)
  const newBranch = Branch.fromFullBranchName(newName);
  const currentBranch = Branch.fromFullBranchName(branches.current);

  if (sameNamepace(newBranch, currentBranch)) {
    throw new Error('Cannot rename branch to a new namespace');
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
