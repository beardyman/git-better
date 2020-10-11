
const git = require('simple-git/promise')();
const {getConfig} = require('./config');
const _ = require('lodash');
const utils = {};

/**
 * Determines if the current working directory is clean or not
 *
 * @returns {Promise<boolean>}
 */
utils.isClean = async ()=>{
  const res = await git.status();
  return res.modified.length === 0;
}

/**
 * Gets the workflow config for a given branch
 *
 * @param {Branch} branch - branch to find the base for
 * @returns {Promise<any>}
 */
utils.getWorkflow = async (branch, config) => {
  if (!config) {
    config = await getConfig();
  }
  return _.get(config, `workflows.${branch.namespace}`);
}

/**
 * Gets the workflow and returns the proper branch from it or returns the default
 *
 * @param {Branch} branch - branch to find the base for
 * @returns {Promise<*>}
 */
utils.getBaseBranch = async (branch) => {
  const config = await getConfig();

  // lookup workflow for branch namespace
  const workflow = await utils.getWorkflow(branch, config);

  // if there's a workflow, set the base branch to the workflow's base branch or use the default base branch
  if (workflow) {
    return workflow.from;
  }
  return config.defaultBase;
}

utils.getAllBaseBranches = (config) => {
  return _.uniq([..._.keys(config.promotionPaths), ..._.values(config.promotionPaths)]);
}

module.exports = utils;
