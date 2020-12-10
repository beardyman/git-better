const git = require('simple-git/promise')();
const open = require('open');
const _ = require('lodash');
const utils = require('./utils');
const Branch = require('./model/branch');
const { getConfig } = require('./config');

/**
 * Helper for creating the helper compare url
 *
 * @param {string} baseUrl - base remote url
 * @param {string} baseBranch - the current branch's base
 * @param {string} currentBranch - the current branch
 * @returns {string} - the compare (pr) url to open
 */
function makePrUrl(baseUrl, baseBranch, currentBranch) {
  return `${_.replace(baseUrl, '.git', '')}/compare/${baseBranch}...${currentBranch}?expand=1`;
}

/**
 * Main execution script
 * @param {Object} [options] - options object
 * @returns {Promise<void>} - a promise that resolves when its complete
 */
async function main(options = {}) {
  const baseUrl = await utils.getUiUrl();
  if (baseUrl) {
    const config = await getConfig();
    const branches = await git.branch();
    const currentBranch = Branch.fromFullBranchName(branches.current);
    const remote = utils.getRemote(config, options);

    // attempt to push any local changes to the current branch
    await git.push(remote, currentBranch.toString());

    // get the workflow so we can find the tos
    const workflow = await utils.getWorkflow(currentBranch);

    // ensure that tos is always an array for easier logic below
    const tos = workflow ? _.flatten([ workflow.to ]) : [ config.defaultBase ];

    await Promise.all(_.map(tos, async(toBase) => {
      const prUrl = makePrUrl(baseUrl, toBase, currentBranch.toString());
      if (options.logger) {
        options.logger(`Opening ${prUrl}...`);
      }
      open(prUrl);
    }));
  } else {
    throw new Error('Could not determine remote UI URL');
  }
}

module.exports = main;
