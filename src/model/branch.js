const _ = require('lodash');

module.exports = class Branch {
  namespace
  version
  branch

  static fromFullBranchName(fullBranchName) {
    return new Branch(Branch._fromString(fullBranchName));
  }

  static _fromString (fqBranchName) {
    const branchParts = fqBranchName.split('/');

    // branch
    // namespace/branch
    // namespace/version/branch
    return {
      namespace: branchParts.length > 1 && branchParts[0] || undefined, // undefined, otherwise it would be false
      version: branchParts.length === 3 && branchParts[1] || undefined, // undefined, otherwise it would be false
      branch: branchParts.length === 1 ?
        branchParts[0] : branchParts.length === 2 ?
          branchParts[1] : branchParts[2]
    }
  }

  constructor({namespace, version, branch}) {
    this.namespace = namespace;
    this.version = version;
    this.branch = branch;
  }

  toString() {
    return _.without([this.namespace, this.version, this.branch], undefined, false).join('/');
  }
}