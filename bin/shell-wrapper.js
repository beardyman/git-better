
const argv = require('minimist')(process.argv.slice(2));
const pkg = require('../package.json');
require('update-notifier')({pkg}).notify();

/**
 * Handles process exiting and error logging
 * Always passes cli args to the main script
 *
 * @param mainScript
 */
module.exports = (mainScript) => {
  mainScript(argv).then(()=>{
    process.exit(0);
  }).catch((err) =>{
    console.log(err.message);
    process.exit(255);
  });
};
