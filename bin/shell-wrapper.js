const scriptArgs = {
  string: [ 'remote' ],
  boolean: [ 'branch', 'global', 'merge', 'push', 'rebase' ],
  alias: {
    branch: 'b',
    global: 'g',
    merge: 'm',
    push: 'p',
    rebase: 'r',
    remote: 'R'
  }
};

const argv = require('minimist')(process.argv.slice(2), scriptArgs);
const _ = require('lodash');

// alias `push` argument with `--push` and `-p` options
if (_.includes(argv._, 'push')) {
  _.set(argv, 'push', true);
  _.set(argv, 'p', true);
}

/**
 * Handles process exiting and error logging
 *
 * @param {Function} mainScript - bin script
 * @returns {Promise} - promise to make tests easier
 */
module.exports = async(mainScript) => {

  // Check for updates asynchronously (non-blocking)
  await (async() => {
    try {
      const updateNotifier = await import('update-notifier');
      const pkg = require('../package.json');
      updateNotifier.default({pkg}).notify();
    } catch {

      // Silently fail if update-notifier fails
    }
  })();

  return mainScript(argv).then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error(err.message);
    process.exit(255);
  });
};
