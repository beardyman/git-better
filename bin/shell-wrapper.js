
// setup notifier for updates
const pkg = require('../package.json');
require('update-notifier')({pkg}).notify();

const scriptArgs = {
  string: [ 'remote' ],
  boolean: [ 'global', 'push', 'merge', 'rebase' ],
  alias: {
    global: 'g',
    push: 'p',
    merge: 'm',
    rebase: 'r',
    remote: 'R'
  }
};

const argv = require('minimist')(process.argv.slice(2), scriptArgs);

/**
 * Handles process exiting and error logging
 * Always passes cli args to the main script
 *
 * @param {Function} mainScript - bin script
 */
module.exports = (mainScript) => {
  mainScript(argv).then(() => {
    process.exit(0);
  }).catch((err) => {
    console.log(err.message);
    process.exit(255);
  });
};
