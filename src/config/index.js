const git = require('simple-git/promise')();
const os = require('os');
const fs = require('fs');
const _ = require('lodash');

/*
 When initialized it will be `.gwfrc.json` but requiring it without the extension allows users to define it as a
 `.js` file as well.
 */
const configFileName = '.gwfrc';
module.exports.configFileName = configFileName;

/**
 * Gets global config, local config and defaults and merges them together returning a compiled config
 * @returns {Promise<any>}
 */
module.exports.getConfig = async () => {
  // get global user config
  const userHomeConfig = `${os.homedir()}/${configFileName}`;
  const globalConfig = fs.existsSync(userHomeConfig) ? require(userHomeConfig) : {};

  // get repo config
  const repoRoot = await git.revparse(['--show-toplevel']);
  const repoConfigFile = `${repoRoot}/${configFileName}`;
  const repoConfig = fs.existsSync(repoConfigFile) ? require(repoConfigFile) : {};

  // get default config
  const defaultConfig = require('./default.json');

  // merge them
  return _.merge(defaultConfig, globalConfig, repoConfig);
};

/**
 * Initializes a config for the tool by copying an example config
 *
 * @param example
 * @param options
 * @returns {Promise<void>}
 */
module.exports.initialize = async function(example, options = {}) {
  const exampleDir = `${__dirname}/../example-configs`;
  let path;

  if(options.global) {
    path = `${os.homedir()}/${configFileName}.json`;
  } else {
    // get repo root path
    const repoRoot = await git.revparse(['--show-toplevel']);
    path = `${repoRoot}/${configFileName}.json`;
  }

  // check to see if it exists so we don't overwrite it
  if (fs.existsSync(path)) {
    throw new Error('Config file already exists. Please remove it if you\'d like to initialize a new config.');
  }

  // check to see if theres an example for the example name the user passed
  const examples = fs.readdirSync(exampleDir)
    .map((filename) => _.replace(filename, '.json', ''));

  if (!examples.includes(example)) {
    throw new Error(`An example by that name does not exist. Possible examples are: ${examples.join(', ')}`);
  }

  // copy the example to the desired location
  fs.copyFileSync(`${exampleDir}/${example}.json`, path);
}
