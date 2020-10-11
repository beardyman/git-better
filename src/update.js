
const git = require('simple-git/promise')();
const Branch = require('./model/branch');
const { getConfig } = require('./config');
const utils = require('./utils');

module.exports = async function update(options) {
  const config = await getConfig();

  const branches = await git.branch();
  const currentBranch = Branch.fromFullBranchName(branches.current);
  const baseBranch = await utils.getBaseBranch(currentBranch);
  const remote = options.remote || config.defaultRemote;

  if (options.logger) {
    options.logger(`Updating ${currentBranch.toString()} from ${baseBranch.toString()}`);
  }

  // make sure the base branch is up to date
  await git.checkout(baseBranch);
  await git.pull(remote, baseBranch);

  // go back to the current branch
  await git.checkout(currentBranch.toString());

  // merge the base branch into the current branch
  await git.mergeFromTo(baseBranch, currentBranch.toString());

  if (config.alwaysPush || options.push) {
    await git.push(remote, currentBranch.toString());
  }
}
