const git = require('simple-git/promise')();
const Branch = require('./model/branch');
const { getConfig, configFileName } = require('./config');
const utils = require('./utils');
const _ = require('lodash');

/**
 * Promotes one base branch to another merging the current branch into the other base. User will be on the promoted
 * branch when complete.
 *
 * Example: Given two base branches `main` and `develop` where `main` is the ultimate trunk branch. When on develop
 * git promote will update the local version of the `main` branch and then merge the `develop` branch into it.
 *
 * @param {Object} [options] - Promote options
 * @param {boolean} [options.push] - Push the changes when complete
 * @returns {Promise<void>} - Promise resolving when complete
 */
module.exports = async function promote(options = {}) {

  if (!await utils.isClean()) {
    throw new Error('Current workspace is not clean.  Please commit, stash, or revert current changes and try again.');
  }

  const config = await getConfig();
  const branches = await git.branch();
  const currentBranch = Branch.fromFullBranchName(branches.current);
  const remote = utils.getRemote(config, options);

  // validation
  if (!_.includes(_.keys(config.promotionPaths), currentBranch.toString())) {
    throw new Error(`Current branch is not promotable. See promotionPaths in ${configFileName}.`);
  }

  const promotionBranch = config.promotionPaths[currentBranch];

  // pull current branch just in case there are other remote changes
  git.pull(remote, currentBranch.toString());

  // update the promotion branch
  await utils.switchToAndUpdateBase(remote, promotionBranch);

  // do promotion
  await git.mergeFromTo(currentBranch.toString(), promotionBranch);

  // push if we need to
  if (utils.shouldPush(config, options)) {
    await git.push(remote, promotionBranch);
    await git.push(remote, currentBranch.toString());
  }
};
