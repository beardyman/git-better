const git = require('simple-git/promise')();
const Branch = require('./model/branch');
const { getConfig, configFileName } = require('./config');
const utils = require('./utils');

/**
 *
 * @param {Object} options - Start options
 * @returns {Promise<void>}
 */
module.exports = async function promote(options) {

  if(!await utils.isClean()) {
    throw new Error('Current workspace is not clean.  Please commit, stash, or revert current changes and try again.');
  }

  const config = await getConfig();
  const branches = await git.branch();
  const currentBranch = Branch.fromFullBranchName(branches.current);
  const remote = options.remote || config.defaultRemote;

  if (!_.includes(_.keys(config.promotionPaths), currentBranch)) {
    throw new Error(`Current branch is not promotable. See promotionPaths in ${configFileName}.`);
  }

  //todo: actual promotion
}
