
const git = require('simple-git/promise')();
const Branch = require('./model/branch');
const { getConfig } = require('./config');
const utils = require('./utils');

module.exports = async function update(opts) {
  const config = await getConfig();

  const branches = await git.branch();
  const currentBranch = Branch.fromFullBranchName(branches.current);
  const baseBranch = await utils.getBaseBranch(currentBranch);

  if (opts.logger) {
    opts.logger(`Updating ${currentBranch.toString()} from ${baseBranch.toString()}`);
  }

  // make sure the base branch is up to date
  await git.checkout(baseBranch);
  await git.pull(config.defaultRemote, baseBranch);

  // go back to the current branch
  await git.checkout(currentBranch.toString());

  // merge the base branch into the current branch
  await git.mergeFromTo(baseBranch, currentBranch.toString());
}
