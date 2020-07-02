
const utils = require('./utils');

module.exports = async function update() {
  const branches = await git.branch();
  const currentBranch = Branch.fromFullBranchName(branches.current);


  // make sure the base branch is up to date
  const baseBranch = utils.getBaseBranch(currentBranch);
  await git.pull('origin', baseBranch.toString());

  // merge the base branch into the current branch
  await git.mergeFromTo(baseBranch.toString(), currentBranch.toString());
}