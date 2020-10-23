
const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();


describe('Rename', () => {
  let rename
    , getConfig
    , git
    , utils
    , fromFullBranchName;


  beforeEach(() => {
    fromFullBranchName = sinon.stub();

    git = {
      checkoutBranch: sinon.stub().resolves(),
      raw: sinon.stub().resolves(),
      push: sinon.stub().resolves(),
      branch: sinon.stub().resolves({current: 'ns/cBranch'})
    };

    utils = {
      getRemote: sinon.stub().returns('origin'),
      shouldPush: sinon.stub().returns(false)
    };

    getConfig = sinon.stub().resolves({alwaysPush: false, defaultRemote: 'origin'});

    sinon.stub(console, 'log');

    rename = proxyquire('../../../src/rename', {
      'simple-git/promise': () => git,
      './config': {getConfig},
      './model/branch': {fromFullBranchName},
      './utils': utils
    });
  });

  afterEach(() => {
    console.log.restore();
  });

  it('should reject when switching namespaces', () => {
    fromFullBranchName.onCall(0).returns({namespace: 'a'});
    fromFullBranchName.onCall(1).returns({namespace: 'b'});

    return expect(rename('spaces/newBranch')).to.be.rejected.then((err) => {
      expect(git.branch.callCount).to.equal(1);
      expect(console.log.callCount).to.equal(0);
      expect(err.message).to.equal('Cannot rename branch to a new namespace');
    });
  });

  it('should rename the branch', () => {
    fromFullBranchName.onCall(0).returns({namespace: 'a', branch: 'c', toString: sinon.stub().returns('a/c')});
    fromFullBranchName.onCall(1).returns({namespace: 'a', branch: 'b', toString: sinon.stub().returns('a/b')});

    return rename('spaces/newBranch', {logger: console.log}).then(() => {
      expect(git.branch.callCount).to.equal(1);
      expect(console.log.callCount).to.equal(1);
      expect(console.log.args[0][0]).to.equal('Renaming branch a/b to a/c');
      expect(git.raw.callCount).to.equal(1);
      expect(git.raw.args[0][0]).to.deep.equal([ 'branch', '-m', 'a/c' ]);
      expect(git.push.callCount).to.equal(0);
    });
  });

  it('shouldn\'t log if no logger is passed', () => {
    fromFullBranchName.onCall(0).returns({namespace: 'a', branch: 'c', toString: sinon.stub().returns('a/c')});
    fromFullBranchName.onCall(1).returns({namespace: 'a', branch: 'b', toString: sinon.stub().returns('a/b')});

    return rename('spaces/newBranch', {}).then(() => {
      expect(git.branch.callCount).to.equal(1);
      expect(console.log.callCount).to.equal(0);
      expect(git.raw.callCount).to.equal(1);
      expect(git.raw.args[0][0]).to.deep.equal([ 'branch', '-m', 'a/c' ]);
      expect(git.push.callCount).to.equal(0);
    });
  });

  it('should work without passing a namespace', () => {
    fromFullBranchName.onCall(0).returns({branch: 'c', toString: sinon.stub().returns('a/c')});
    fromFullBranchName.onCall(1).returns({namespace: 'a', branch: 'b', toString: sinon.stub().returns('a/b')});

    return rename('spaces/newBranch', {logger: console.log}).then(() => {
      expect(git.branch.callCount).to.equal(1);
      expect(console.log.callCount).to.equal(1);
      expect(console.log.args[0][0]).to.equal('Renaming branch a/b to a/c');
      expect(git.raw.callCount).to.equal(1);
      expect(git.raw.args[0][0]).to.deep.equal([ 'branch', '-m', 'a/c' ]);
      expect(git.push.callCount).to.equal(0);
    });
  });

  it('should push to the remote when we\'re supposed to', () => {
    fromFullBranchName.onCall(0).returns({namespace: 'a', branch: 'c', toString: sinon.stub().returns('a/c')});
    fromFullBranchName.onCall(1).returns({namespace: 'a', branch: 'b', toString: sinon.stub().returns('a/b')});

    utils.shouldPush.returns(true);

    return rename('spaces/newBranch', {logger: console.log}).then(() => {
      expect(git.branch.callCount).to.equal(1);
      expect(console.log.callCount).to.equal(1);
      expect(console.log.args[0][0]).to.equal('Renaming branch a/b to a/c');
      expect(git.raw.callCount).to.equal(1);
      expect(git.raw.args[0][0]).to.deep.equal([ 'branch', '-m', 'a/c' ]);
      expect(git.push.callCount).to.equal(2);

      // push the new branch
      expect(git.push.args[0][0]).to.equal('origin');
      expect(git.push.args[0][1]).to.equal('a/c');

      // delete the old branch
      expect(git.push.args[1][0]).to.equal('origin');
      expect(git.push.args[1][1]).to.equal('a/b');
      expect(git.push.args[1][2]).to.deep.equal({'--delete': undefined});
    });
  });
});
