
const git = require('simple-git')();
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
 * Converts SSH URL to HTTPS format
 *
 * @param {string} url - SSH URL to convert
 * @returns {string} - Converted HTTPS URL
 * @private
 */
function convertSshToHttps(url) {
  let converted = url;

  // Handle ssh:// protocol format: ssh://git@github.com/user/repo.git
  if (_.startsWith(converted, 'ssh://')) {
    converted = _.replace(converted, /^ssh:\/\/git@/, 'https://');

    // Remove port specification if present (e.g., :22)
    converted = _.replace(converted, /:\d+\//, '/');
  } else if (_.startsWith(converted, 'git@')) {

    // Handle SCP-style format: git@github.com:user/repo.git
    converted = _.replace(converted, ':', '/');
    converted = _.replace(converted, 'git@', 'https://');
  }

  return converted;
}

/**
 * Normalizes a Git remote URL to HTTPS format suitable for browser
 * Handles ssh://, git@, and https:// formats
 *
 * @param {string} remoteUrl - Git remote URL in any format
 * @returns {string} - Normalized HTTPS URL without .git extension
 * @throws {Error} - If URL format is not recognized
 * @private
 */
function normalizeGitUrl(remoteUrl) {
  if (!remoteUrl || typeof remoteUrl !== 'string') {
    throw new Error('Invalid remote URL: URL must be a non-empty string');
  }

  let normalized = convertSshToHttps(remoteUrl);

  // Validate that we have a valid HTTP/HTTPS URL
  if (!_.startsWith(normalized, 'http://') && !_.startsWith(normalized, 'https://')) {
    throw new Error(`Unsupported remote URL format: ${remoteUrl}`);
  }

  // Remove .git extension if present
  normalized = _.replace(normalized, /\.git$/, '');

  return normalized;
}

/**
 * Gets the Ui's base URL
 * @returns {Promise<string>} the base url
 */
utils.getUiUrl = async() => {
  const remotes = await git.getRemotes(true);
  const remoteUrl = _.get(_.find(remotes, {name: 'origin'}), 'refs.fetch');

  if (!remoteUrl) {
    throw new Error('No origin remote found');
  }

  return normalizeGitUrl(remoteUrl);
};

/**
 * Deterimines if we should push or not
 *
 * @param {Object} config - the config for this module
 * @param {Object} options - user options passed in.
 * @returns {boolean} - true if we should push
 */
utils.shouldPush = (config, options = {}) => !!(config.alwaysPush || options.push);

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
