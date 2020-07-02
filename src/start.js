const git = require('simple-git/promise')();
const Branch = require('./model/branch');
const {getConfig} = require('./config');
const _ = require('lodash');

/**
 * Starts a new branch for a given namespace by ensuring that its created from the appropriate and up-to-date base
 * branch
 *
 * @param {Branch} branch - Branch data object representing the branch to start
 * @returns {Promise<void>}
 */
module.exports = async function start(branch) {
  const baseBranch = await getBaseBranch(branch);

  git.clean('n')


  // checkout the base branch and update it
  // create a new branch from the base branch

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