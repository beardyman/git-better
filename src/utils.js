
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
 * Gets the workflow and returns the proper branch from it or returns the default
 *
 * @param {Branch} branch - branch to find the base for
 * @returns {Promise<*>}
 */
utils.getBaseBranch = async (branch) => {
  const config = await getConfig()

  // lookup workflow for branch namespace
  const workflow = _.get(config, `workflows.${branch.namespace}`);

  // if there's a workflow, set the base branch to the workflow's base branch or use the default base branch
  if (workflow) {
    return workflow.from;
  }
  return config.defaultBase;
}

module.exports = utils;