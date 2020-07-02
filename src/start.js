const git = require('simple-git/promise')();
const Branch = require('./model/branch');
const {getConfig} = require('./config');
const utils = require('./utils');
const _ = require('lodash');

/**
 * Starts a new branch for a given namespace by ensuring that its created from the appropriate and up-to-date base
 * branch
 *
 * @param {Branch} branch - Branch data object representing the branch to start
 * @returns {Promise<void>}
 */
module.exports = async function start(branch) {

  if(!await utils.isClean()) {
    throw new Error('Current workspace is not clean.  Please commit, stash, or revert current changes.');
  }

  const baseBranch = await getBaseBranch(branch);

  // checkout the base branch and update it
  await git.pull('origin', baseBranch);

  // create a new branch from the base branch
  await git.checkoutBranch(branch.toString(), `origin/${baseBranch}`);
}

/**
 * Gets the workflow and returns the proper branch from it or returns the default
 *
 * @param branch
 * @returns {Promise<*>}
 */
async function getBaseBranch(branch) {
  const config = await getConfig()

  // lookup workflow for branch namespace
  const workflow = _.get(config, `workflows.${branch.namespace}`);

  // if there's a workflow, set the base branch to the workflow's base branch or use the default base branch
  if (workflow) {
    return workflow.from;
  }
  return config.defaultBase;
}