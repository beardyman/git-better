const git = require('simple-git/promise')();
const Branch = require('./model/branch');
const utils = require('./utils');
const { getConfig } = require('./config');
const _ = require('lodash');

module.exports = async function finish(options = {}) {
  const config = await getConfig();
  const branches = await git.branch();
  const currentBranch = Branch.fromFullBranchName(branches.current);
  const baseFromBranch = await utils.getBaseBranch(currentBranch);
  const remote = options.remote || config.defaultRemote;
  const push = config.alwaysPush || options.push;

  // make sure we're not trying to finish a base branch
  if (_.includes(utils.getAllBaseBranches(config), currentBranch.toString())){
    throw new Error(`Trying to finish a base branch (${currentBranch.toString()}) is not allowed.`);
  }

  // make sure the base branch is up to date
  await git.checkout(baseFromBranch);
  await git.pull(remote, baseFromBranch);
  await git.checkout(currentBranch.toString());

  // merge the base branch into the current branch so we can resolve conflicts on the working branch
  await git.mergeFromTo(baseFromBranch, currentBranch.toString());

  // merge the working branch into each of the base branches
  const workflow = await utils.getWorkflow(currentBranch);
  const tos = _.flatten([workflow.to]); // ensure that tos is always an array for easier logic below

  await Promise.all(_.map(tos, async (toBase) => {
    await git.checkout(toBase);

    // merge the current branch into the base
    await git.mergeFromTo(currentBranch.toString(), toBase);

    // push the base branch if we need to
    if (push) {
      await git.push(remote, toBase);
    }
  }));

  // delete the working branch
  await git.deleteLocalBranch(currentBranch.toString(), true);

  // delete the remote branch if we're pushing
  if (push) {
    await git.push(remote, currentBranch.toString(), {'--delete': undefined})
  }
}
