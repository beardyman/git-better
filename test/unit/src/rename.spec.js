const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');


describe('Rename', () => {
  let rename;


  beforeEach(()=>{
    fromFullBranchName = sinon.stub();

    git = {
      checkoutBranch: sinon.stub().resolves(),
      deleteLocalBranch: sinon.stub().resolves(),
      push: sinon.stub().resolves(),
      branch: sinon.stub().resolves({current: 'ns/cBranch'}),
    };

    sinon.stub(console, 'log');

    rename = proxyquire('../../../src/rename', {
      'simple-git/promise': () => git,
      './model/branch': {fromFullBranchName}
    });
  });

  afterEach(() => {
    console.log.restore();
  });

  it('should reject when switching namespaces', () => {
    fromFullBranchName.onCall(0).returns({namespace:'a'});
    fromFullBranchName.onCall(1).returns({namespace:'b'});

    return rename('spaces/newBranch').then(() => {
      throw new Error('should have thrown');
    }).catch((err)=>{
      expect(git.branch.callCount).to.equal(1);
      expect(console.log.callCount).to.equal(0);
      expect(err.message).to.equal('Cannot rename branch to a new namespace');
    });
  });

  it('should checkout the new branch and delete the old branch', () => {
    fromFullBranchName.onCall(0).returns({namespace:'a', branch: 'c', toString: sinon.stub().returns('a/c')});
    fromFullBranchName.onCall(1).returns({namespace:'a', branch: 'b', toString: sinon.stub().returns('a/b')});

    return rename('spaces/newBranch').then(() => {
      expect(git.branch.callCount).to.equal(1);
      expect(console.log.callCount).to.equal(1);
      expect(console.log.args[0][0]).to.equal('Renaming branch a/b to a/c');
      expect(git.checkoutBranch.callCount).to.equal(1);
      expect(git.checkoutBranch.args[0][0]).to.equal('a/c');
      expect(git.checkoutBranch.args[0][1]).to.equal('a/b');
      expect(git.deleteLocalBranch.callCount).to.equal(1);
      expect(git.deleteLocalBranch.args[0][0]).to.equal('a/b');
      expect(git.push.callCount).to.equal(0);
    });
  });

  it('should work without passing a namespace', () => {
    fromFullBranchName.onCall(0).returns({branch: 'c', toString: sinon.stub().returns('a/c')});
    fromFullBranchName.onCall(1).returns({namespace:'a', branch: 'b', toString: sinon.stub().returns('a/b')});

    return rename('spaces/newBranch').then(() => {
      expect(git.branch.callCount).to.equal(1);
      expect(console.log.callCount).to.equal(1);
      expect(console.log.args[0][0]).to.equal('Renaming branch a/b to a/c');
      expect(git.checkoutBranch.callCount).to.equal(1);
      expect(git.checkoutBranch.args[0][0]).to.equal('a/c');
      expect(git.checkoutBranch.args[0][1]).to.equal('a/b');
      expect(git.deleteLocalBranch.callCount).to.equal(1);
      expect(git.deleteLocalBranch.args[0][0]).to.equal('a/b');
      expect(git.push.callCount).to.equal(0);
    });
  });

  it('should push to the remote when the flag is passed', () => {
    fromFullBranchName.onCall(0).returns({namespace:'a', branch: 'c', toString: sinon.stub().returns('a/c')});
    fromFullBranchName.onCall(1).returns({namespace:'a', branch: 'b', toString: sinon.stub().returns('a/b')});

    return rename('spaces/newBranch', {push: true}).then(() => {
      expect(git.branch.callCount).to.equal(1);
      expect(console.log.callCount).to.equal(1);
      expect(console.log.args[0][0]).to.equal('Renaming branch a/b to a/c');
      expect(git.checkoutBranch.callCount).to.equal(1);
      expect(git.checkoutBranch.args[0][0]).to.equal('a/c');
      expect(git.checkoutBranch.args[0][1]).to.equal('a/b');
      expect(git.deleteLocalBranch.callCount).to.equal(1);
      expect(git.deleteLocalBranch.args[0][0]).to.equal('a/b');
      expect(git.push.callCount).to.equal(2);

      // push the new branch
      expect(git.push.args[0][0]).to.equal('origin');
      expect(git.push.args[0][1]).to.equal('a/c');

      // delete the old branch
      expect(git.push.args[1][0]).to.equal('origin');
      expect(git.push.args[1][1]).to.equal('a/b');
      expect(git.push.args[1][2]).to.deep.equal({'--delete': 'a/b'});
    });
  });

});