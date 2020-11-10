const open = require('open');
const _ = require('lodash');
const git = require('simple-git/promise')();


/**
 * Attempts to get the remote URL of the origin
 * @param {boolean} [branchFlag] - get the url for a branch
 * @returns {Promise<*>} - returns the url to open
 */
async function getURL(branchFlag = false) {
  const remotes = await git.getRemotes(true);
  let remoteUrl = _.get(_.find(remotes, {name: 'origin'}), 'refs.fetch');

  // handle ssh clones
  if (_.startsWith(remoteUrl, 'git@')) {
    remoteUrl = _.replace(remoteUrl, ':', '/'); // replaces `:` before username
    remoteUrl = _.replace(remoteUrl, 'git@', 'https://');
  }

  if (branchFlag) {
    const currentBranch = await git.branch();
    remoteUrl = `${_.replace(remoteUrl, '.git', '')}/tree/${currentBranch.current}`;
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
    open(url);
  } else {
    throw new Error('Could not determine remote UI URL');
  }
}

module.exports = main;
