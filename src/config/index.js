const git = require('simple-git/promise')();
const os = require('os');
const fs = require('fs');
const _ = require('lodash');
const configFileName = '.gwfrc.json'
module.exports.configFileName = configFileName;
module.exports.getConfig = async () => {
  // get global user config
  const userHomeConfig = `${os.homedir()}/${configFileName}`;
  const globalConfig = fs.existsSync(userHomeConfig) ? require(userHomeConfig) : {};

  // get repo config
  const repoRoot = await git.revparse(['--show-toplevel']);
  const repoConfigFile = `${repoRoot}/${configFileName}`
  const repoConfig = fs.existsSync(repoConfigFile) ? require(repoConfigFile) : {};

  // get default config
  const defaultConfig = require('./default.json')

  // merge them
  return _.merge(defaultConfig, globalConfig, repoConfig);
};

