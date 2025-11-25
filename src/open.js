const git = require('simple-git')();
const utils = require('./utils');
const { getOpen } = require('./browser-open');

/**
 * Attempts to get the remote URL of the origin
 * @param {boolean} [branchFlag] - get the url for a branch
 * @returns {Promise<*>} - returns the url to open
 */
async function getURL(branchFlag = false) {
  let remoteUrl = await utils.getUiUrl();

  if (branchFlag) {
    const currentBranch = await git.branch();
    remoteUrl = `${remoteUrl}/tree/${currentBranch.current}`;
  }

  return remoteUrl;
}

/**
 * Main execution script
 * @param {Object} [options] - options object
 * @returns {Promise<void>} - a promise that resolves when its complete
 */
async function main(options = {}) {
  const url = await getURL(options.branch);
  if (url) {
    if (options.logger) {
      options.logger(`Opening ${url}...`);
    }

    // Dynamically import 'open' as it's an ES module
    const open = await getOpen();
    await open(url);
  } else {
    throw new Error('Could not determine remote UI URL');
  }
}

module.exports = main;
