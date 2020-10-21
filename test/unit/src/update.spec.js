/* eslint-disable */

const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();


describe('Update', () => {
  let update
    , getConfig
    , fromFullBranchName
    , git
    , utils;


  beforeEach(() => {
    fromFullBranchName = sinon.stub().returns('currentBranch');

    git = {
      branch: sinon.stub().resolves({}),
      mergeFromTo: sinon.stub().resolves(),
      push: sinon.stub().resolves()
    };

    utils = {
      switchToAndUpdateBase: sinon.stub().resolves(),
      getBaseBranch: sinon.stub().resolves('baseBranch'),
      getRemote: sinon.stub().returns('origin')
    };

    getConfig = sinon.stub().resolves({alwaysPush: false});

    sinon.stub(console, 'log');

    update = proxyquire('../../../src/update', {
      'simple-git/promise': () => git,
      './config': {getConfig},
      './model/branch': {fromFullBranchName},
      './utils': utils
    });
  });

  afterEach(() => {
    console.log.restore();
  });

  it('should merge in the base branch and tell the user about it', () => update({logger: console.log}).then(() => {

    // setup stuff
    expect(getConfig.callCount).to.equal(1);
    expect(git.branch.callCount).to.equal(1);
    expect(fromFullBranchName.callCount).to.equal(1);
    expect(utils.getBaseBranch.callCount).to.equal(1);

    // check that we told the User what we're doing
    expect(console.log.callCount).to.equal(1);
    expect(console.log.args[0][0]).to.match(/Updating.*currentBranch.*baseBranch/);

    // check that we're updating the base branch before updating the current branch
    expect(utils.switchToAndUpdateBase.callCount).to.equal(1);
    expect(utils.switchToAndUpdateBase.args[0][0]).to.equal('origin');
    expect(utils.switchToAndUpdateBase.args[0][1]).to.equal('baseBranch');
    expect(utils.switchToAndUpdateBase.args[0][2]).to.equal('currentBranch');



    // check that the merge was the right way
    expect(git.mergeFromTo.callCount).to.equal(1);
    expect(git.mergeFromTo.args[0][0]).to.equal('baseBranch');
    expect(git.mergeFromTo.args[0][1]).to.equal('currentBranch');
    expect(git.push.callCount).to.equal(0);
  }));

});
