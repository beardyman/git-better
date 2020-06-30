const _ = require('lodash');

module.exports = class branch {
  namespace
  version
  branch

  constructor(branchString) {
    const branchParts = this._fromString(branchString);
    this.namespace = branchParts.namespace;
    this.version = branchParts.version;
    this.branch = branchParts.branch;
  }

  _fromString (fqBranchName) {
    const branchParts = fqBranchName.split('/');

    // branch
    // namespace/branch
    // namespace/version/branch
    return {
      namespace: branchParts.length > 1 && branchParts[0],
      version: branchParts.length === 3 && branchParts[1],
      branch: branchParts.length === 1 ?
        branchParts[0] : branchParts.length === 2 ?
          branchParts[1] : branchParts[2]
    }
  }

  toString() {
    return _.without([this.namespace, this.version, this.branch], false).join('/');
  }
}