
const expect = require('chai').expect;
const Branch = require('../../../../src/model/branch');

describe('Branch Model', () => {
  it('should set the branch name properly return the branch name for a non-namespaced branch', () => {
    const branch = new Branch({branch: 'maiBranch'});
    expect(branch.namespace).to.equal(undefined);
    expect(branch.version).to.equal(undefined);
    expect(branch.branch).to.equal('maiBranch');
    expect(branch.toString()).to.equal('maiBranch');
  });

  it('should set the branch name properly return the branch name for a namespaced branch', () => {
    const branch = new Branch({namespace: 'name', branch: 'maiBranch'});
    expect(branch.namespace).to.equal('name')
    expect(branch.version).to.equal(undefined);
    expect(branch.branch).to.equal('maiBranch');
    expect(branch.toString()).to.equal('name/maiBranch');
  });

  it('should set the branch name properly return the branch name for a versioned branch', () => {
    const branch = new Branch({namespace: 'release', version:'version', branch: 'maiBranch'});
    expect(branch.namespace).to.equal('release')
    expect(branch.version).to.equal('version')
    expect(branch.branch).to.equal('maiBranch');
    expect(branch.toString()).to.equal('release/version/maiBranch');
  });

  describe('fromFullBranchName', () => {
    it('should set the branch name properly return the branch name for a non-namespaced branch', () => {
      const branch = Branch.fromFullBranchName('maiBranch');
      expect(branch.namespace).to.equal(undefined);
      expect(branch.version).to.equal(undefined);
      expect(branch.branch).to.equal('maiBranch');
      expect(branch.toString()).to.equal('maiBranch');
    });

    it('should set the branch name properly return the branch name for a namespaced branch', () => {
      const branch = Branch.fromFullBranchName('name/maiBranch');
      expect(branch.namespace).to.equal('name')
      expect(branch.version).to.equal(undefined);
      expect(branch.branch).to.equal('maiBranch');
      expect(branch.toString()).to.equal('name/maiBranch');
    });

    it('should set the branch name properly return the branch name for a versioned branch', () => {
      const branch = Branch.fromFullBranchName('release/version/maiBranch');
      expect(branch.namespace).to.equal('release')
      expect(branch.version).to.equal('version')
      expect(branch.branch).to.equal('maiBranch');
      expect(branch.toString()).to.equal('release/version/maiBranch');
    });
  });
});

