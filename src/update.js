
const git = require('simple-git/promise')();
const Branch = require('./model/branch');
const { getConfig } = require('./config');
const utils = require('./utils');

module.exports = async function update() {
  const config = await getConfig();

  const branches = await git.branch();
  const currentBranch = Branch.fromFullBranchName(branches.current);


  // make sure the base branch is up to date
  const baseBranch = await utils.getBaseBranch(currentBranch);
  await git.pull(config.defaultRemote, baseBranch);
  await git.mergeFromTo(`${config.defaultRemote}/${baseBranch}`, baseBranch);

  console.log(`Updating ${currentBranch.toString()} from ${baseBranch.toString()}`);

  // merge the base branch into the current branch
  await git.mergeFromTo(baseBranch, currentBranch.toString());
}