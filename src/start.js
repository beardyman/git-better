const git = require('simple-git/promise')();
const { getConfig } = require('./config');
const utils = require('./utils');

/**
 * Starts a new branch for a given namespace by ensuring that its created from the appropriate and up-to-date base
 * branch
 *
 * @param {Branch} branch - Branch data object representing the branch to start
 * @param {Object} options - Start options
 * @returns {Promise<void>} - Promise resolving when complete
 */
module.exports = async function start(branch, options = {}) {

  if (!await utils.isClean()) {
    throw new Error('Current workspace is not clean.  Please commit, stash, or revert current changes and try again.');
  }

  const config = await getConfig();
  const baseBranch = await utils.getBaseBranch(branch);
  const remote = utils.getRemote(config, options);

  // pull the base branch and update it
  await utils.switchToAndUpdateBase(remote, baseBranch);

  // create a new branch from the base branch
  await git.checkoutBranch(branch.toString(), baseBranch);
};
