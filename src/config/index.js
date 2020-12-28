const git = require('simple-git/promise')();
const os = require('os');
const fs = require('fs');
const _ = require('lodash');
let config;

/*
 When initialized it will be `.gbrc.json` but requiring it without the extension allows users to define it as a
 `.js` file as well.
 */
const configFileName = '.gbrc';
module.exports.configFileName = configFileName;

/**
 * Gets global config, local config and defaults and merges them together returning a compiled config
 *
 * @returns {Promise<any>} - resolves with the combined config
 */
module.exports.getConfig = async() => {

  if (!config) {
    const userHomeConfig = `${os.homedir()}/${configFileName}`;
    const repoRoot = await git.revparse([ '--show-toplevel' ]);
    const repoConfigFile = `${repoRoot}/${configFileName}`;

    // get global user config
    let globalConfig = _.attempt(require, userHomeConfig)

      // get repo config
      ,repoConfig = _.attempt(require, repoConfigFile);

    // default configs if they can't be found
    if (globalConfig instanceof Error) {
      globalConfig = {};
    }
    if (repoConfig instanceof Error) {
      repoConfig = {};
    }

    // get default config
    const defaultConfig = require('./default.json');

    // merge them
    config = _.merge(defaultConfig, globalConfig, repoConfig);
  }

  return config;
};

/**
 * Initializes a config for the tool by copying an example config
 *
 * @param {string} [example] - name of the example to base the config on
 * @param {Object} [options] - any options required
 * @param {boolean} [options.global] - if true, the config will be placed in the current users home directory
 * @returns {Promise<void>} - When complete
 */
module.exports.initialize = async function(example = false, options = {}) {
  const exampleDir = `${__dirname}/../../example-configs`;
  let path;

  if (options.global) {
    path = `${os.homedir()}/${configFileName}.json`;
  } else {

    // get repo root path
    const repoRoot = await git.revparse([ '--show-toplevel' ]);
    path = `${repoRoot}/${configFileName}.json`;
  }

  // check to see if it exists so we don't overwrite it
  if (fs.existsSync(path)) {
    throw new Error('Config file already exists. Please remove it if you\'d like to initialize a new config.');
  }



  // no example provided
  if (!example) {

    // lets just make a blank config file
    fs.writeFileSync(path, '{\n\n}');

    // if we want to use an example
  } else {

    // check to see if theres an example for the example name the user passed
    const examples = fs.readdirSync(exampleDir)
      .map((filename) => _.replace(filename, '.json', ''));

    if (examples.includes(example)) {

      // copy the example to the desired location
      fs.copyFileSync(`${exampleDir}/${example}.json`, path);
    } else {
      throw new Error(`An example by that name does not exist. Possible examples are: ${examples.join(', ')}`);
    }
  }


};
