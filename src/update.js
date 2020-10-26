
const git = require('simple-git/promise')();
const Branch = require('./model/branch');
const { getConfig } = require('./config');
const utils = require('./utils');

/**
 * Finishes a branch by merging it into appropriate base branches and then deleting it
 *
 * @param {Object} options - script options for specifying remotes and/or pushing when done
 * @returns {Promise<void>} - resolves when complete
 */
module.exports = async function update(options = {}) {
  const config = await getConfig();

  const branches = await git.branch();
  const currentBranch = Branch.fromFullBranchName(branches.current);
  const baseBranch = await utils.getBaseBranch(currentBranch);
  const remote = utils.getRemote(config, options);

  if (options.logger) {
    options.logger(`Updating ${currentBranch.toString()} from ${baseBranch.toString()}`);
  }

  // make sure the base branch is up to date
  await utils.switchToAndUpdateBase(remote, baseBranch.toString(), currentBranch.toString());


  // merge the base branch into the current branch
  await git.mergeFromTo(baseBranch, currentBranch.toString());

  if (utils.shouldPush(config, options)) {
    await git.push(remote, currentBranch.toString());
  }
};
