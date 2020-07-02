const git = require('simple-git/promise')();
const Branch = require('./model/branch');

/**
 * Starts a new branch for a given namespace by ensuring that its created from the appropriate and up-to-date base
 * branch
 *
 * @param {Branch} branch - Branch data object representing the branch to start
 * @returns {Promise<void>}
 */
module.exports = async function start(branch) {
  


}