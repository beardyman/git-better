
const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();


describe('Promote', () => {
  let promote
    , getConfig
    , utils
    , git
    , fromFullBranchName;


  beforeEach(() => {
    fromFullBranchName = sinon.stub().returns('workingBranch');

    git = {
      branch: sinon.stub().resolves({current: 'workingBranch'}),
      mergeFromTo: sinon.stub().resolves(),
      pull: sinon.stub().resolves(),
      push: sinon.stub().resolves()
    };

    getConfig = sinon.stub().resolves({
      alwaysPush: false,
      defaultRemote: 'origin',
      promotionPaths: {
        workingBranch: 'main'
      }
    });

    utils = {
      shouldPush: sinon.stub().returns(false),
      isClean: sinon.stub().resolves(true),
      getRemote: sinon.stub().returns('origin'),
      switchToAndUpdateBase: sinon.stub().resolves()
    };

    sinon.stub(console, 'log');

    promote = proxyquire('../../../src/promote', {
      'simple-git': () => git,
      './config': {getConfig},
      './model/branch': {fromFullBranchName},
      './utils': utils
    });
  });

  afterEach(() => {
    console.log.restore();
  });

  it('should throw an error if the working branch is not clean for some reason', () => {
    utils.isClean.resolves(false);
    return expect(promote()).to.be.rejected.then((err) => {
      expect(err.message).to.match(/Current workspace is not clean.*/);
    });
  });

  it('should throw an error if the current branch is not promotable', () => {
    getConfig.resolves({promotionPaths: {garbage: true }});

    return expect(promote()).to.be.rejected.then((err) => {
      expect(err.message).to.match(/Current branch is not promotable.*/);
    });
  });

  it('should promote the branch', () => promote().then(() => {

    // check that its updating the current branch
    expect(git.pull.callCount).to.equal(1);
    expect(git.pull.args[0][0]).to.equal('origin');
    expect(git.pull.args[0][1]).to.equal('workingBranch');

    // check that its updating the base
    expect(utils.switchToAndUpdateBase.callCount).to.equal(1);
    expect(utils.switchToAndUpdateBase.args[0][0]).to.equal('origin');
    expect(utils.switchToAndUpdateBase.args[0][1]).to.equal('main');

    // check that it merges the current branch into the base branch
    expect(git.mergeFromTo.callCount).to.equal(1);
    expect(git.mergeFromTo.args[0][0]).to.equal('workingBranch');
    expect(git.mergeFromTo.args[0][1]).to.equal('main');

    // check that it doesn't push anything
    expect(utils.shouldPush.callCount).to.equal(1);
    expect(git.push.callCount).to.equal(0);
  }));

  it('should promote the branch and push it if we\'re configured to', () => {
    utils.shouldPush.returns(true);

    return promote().then(() => {

      // check that its updating the current branch
      expect(git.pull.callCount).to.equal(1);
      expect(git.pull.args[0][0]).to.equal('origin');
      expect(git.pull.args[0][1]).to.equal('workingBranch');

      // check that its updating the base
      expect(utils.switchToAndUpdateBase.callCount).to.equal(1);
      expect(utils.switchToAndUpdateBase.args[0][0]).to.equal('origin');
      expect(utils.switchToAndUpdateBase.args[0][1]).to.equal('main');

      // check that it merges the current branch into the base branch
      expect(git.mergeFromTo.callCount).to.equal(1);
      expect(git.mergeFromTo.args[0][0]).to.equal('workingBranch');
      expect(git.mergeFromTo.args[0][1]).to.equal('main');

      // check that it pushes stuff
      expect(utils.shouldPush.callCount).to.equal(1);
      expect(git.push.callCount).to.equal(2);
    });
  });

});
