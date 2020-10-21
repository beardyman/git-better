const _ = require('lodash');

module.exports = class Branch {

  /**
   * Initializes a Branch object from a given string. The given string is generally the branch name the way git
   * would report it.
   *
   * @param {string} fullBranchName - A branch name the way git would report it
   * @returns {Branch} - A new Branch object
   */
  static fromFullBranchName(fullBranchName) {
    return new Branch(Branch._fromString(fullBranchName));
  }

  /**
   * Helper for parsing a branch string and returns an object with its parts
   *
   * @param {string} fqBranchName - the full branch name as a single string
   * @returns {{namespace: (*|undefined), version: (*|undefined), branch: *}} - an object literal representation of
   * the branch
   *
   * @private
   */
  static _fromString(fqBranchName) {
    const branchParts = fqBranchName.split('/');

    // branch
    // namespace/branch
    // namespace/version/branch
    return {
      namespace: branchParts.length > 1 ? branchParts[0] : undefined, // undefined, otherwise it would be false
      version: branchParts.length === 3 ? branchParts[1] : undefined, // undefined, otherwise it would be false
      branch: branchParts.length === 1
        ? branchParts[0] : branchParts.length === 2
          ? branchParts[1] : branchParts[2]
    };
  }

  /**
   * Creates a Branch object
   *
   * @param {string} [namespace] - the namespace or the name of the workflow for the branch
   * @param {string} [version] - an optional version if this is a versioned workflow
   * @param {string} branch - the branch name
   */
  constructor({namespace, version, branch}) {
    this.namespace = namespace;
    this.version = version;
    this.branch = branch;
  }

  /**
   * Converts the Branch back into a string in the way that git would report it
   *
   * @returns {string} - branch name in the format that git would report it.
   */
  toString() {
    return _.without([ this.namespace, this.version, this.branch ], undefined, false).join('/');
  }
};
