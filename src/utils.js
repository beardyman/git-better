
module.exports = {
  parseBranch: (fqBranchName) => {
    branchParts = fqBranchName.split('/');

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
}