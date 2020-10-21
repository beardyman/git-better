
const git = require('simple-git/promise')();
const {getConfig} = require('./config');
const _ = require('lodash');
const utils = {};


/**
 * Parses the remote from the config or options
 *
 * @param {Object} config - the compiled config for this module
 * @param {Object} options - options passed by the user
 * @returns {string} - the resulting remote that should be used
 */
utils.getRemote = (config, options = {}) => options.remote || config.defaultRemote;

/**
 * Determines if the current working directory is clean or not
 *
 * @returns {Promise<boolean>} - resolves true if there are no changes from the last commit in the current branch
 */
utils.isClean = async() => {
  const res = await git.status();
  return res.modified.length === 0;
};

/**
 * Checks out the base and updates it, optionally switches back to the current branch
 *
 * @param {string} remote - remote to pull from
 * @param {string} baseBranch - base branch to update
 * @param {boolean} [switchBackBranch] - branch to checkout after updating the base branch
 * @returns {Promise<void>} - resolves when complete
 */
utils.switchToAndUpdateBase = async(remote, baseBranch, switchBackBranch) => {
  await git.checkout(baseBranch);
  await git.pull(remote, baseBranch);
  if (switchBackBranch) {
    await git.checkout(switchBackBranch);
  }
};

/**
 * Gets the workflow config for a given branch
 *
 * @param {Branch} branch - branch to find the base for
 * @param {Object} [config] - the config for this module.  If passed it will prevent another config lookup
 * @returns {Promise<Object>} - the config for a given workflow
 */
utils.getWorkflow = async(branch, config) => {
  if (!config) {
    config = await getConfig();
  }
  return _.get(config, `workflows.${branch.namespace}`);
};

/**
 * Gets the workflow and returns the proper branch from it or returns the default
 *
 * @param {Branch} branch - branch to find the base for
 * @returns {Promise<string>} - Resolves with the base branch for the workflow if one is found, otherwise the
 * default base from config is returned
 */
utils.getBaseBranch = async(branch) => {
  const config = await getConfig();

  // lookup workflow for branch namespace
  const workflow = await utils.getWorkflow(branch, config);

  // if there's a workflow, set the base branch to the workflow's base branch or use the default base branch
  if (workflow) {
    return workflow.from;
  }
  return config.defaultBase;
};

/**
 * Get all of the base branches from the config
 *
 * @param {Object} config - the config for this module
 * @returns {string[]} array of base branches
 */
utils.getAllBaseBranches = (config) => _.uniq([ ..._.keys(config.promotionPaths), ..._.values(config.promotionPaths) ]);

module.exports = utils;
