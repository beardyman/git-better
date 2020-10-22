
const git = require('simple-git/promise')();
const Branch = require('./model/branch');
const { getConfig } = require('./config');
const utils = require('./utils');

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
  await utils.switchToAndUpdateBase(remote, baseBranch, currentBranch);


  // merge the base branch into the current branch
  await git.mergeFromTo(baseBranch, currentBranch.toString());

  if (utils.shouldPush(config, options)) {
    await git.push(remote, currentBranch.toString());
  }
};
