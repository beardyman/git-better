
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised.default);
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();


describe('Finish', () => {
  let finish
    , fromFullBranchName
    , getConfig
    , utils
    , git;

  beforeEach(() => {
    fromFullBranchName = sinon.stub().returns('ns/cBranch');

    git = {
      branch: sinon.stub().resolves({current: 'ns/cBranch'}),
      checkout: sinon.stub().resolves(),
      deleteLocalBranch: sinon.stub().resolves(),
      mergeFromTo: sinon.stub().resolves(),
      push: sinon.stub().resolves()
    };

    utils = {
      getAllBaseBranches: sinon.stub().returns([ 'main' ]),
      getBaseBranch: sinon.stub().resolves('main'),
      getRemote: sinon.stub().returns('origin'),
      getWorkflow: sinon.stub().resolves({to: [ 'main' ]}),
      shouldPush: sinon.stub().returns(false),
      switchToAndUpdateBase: sinon.stub().resolves()
    };

    getConfig = sinon.stub().resolves({alwaysPush: false, defaultBase: 'dBranch', defaultRemote: 'origin'});

    sinon.stub(console, 'log');

    finish = proxyquire('../../../src/finish', {
      'simple-git': () => git,
      './config': {getConfig},
      './model/branch': {fromFullBranchName},
      './utils': utils
    });
  });

  afterEach(() => {
    console.log.restore();
  });

  it('should throw an error when trying to finish a base branch', () => {
    fromFullBranchName.returns('main');
    return expect(finish()).to.be.rejected.then((err) => {
      expect(err.message).to.match(/Trying to finish a base branch.*/);
    });
  });

  it('should finish the branch', () => finish().then(() => {

    // check that we're updating the base
    expect(utils.switchToAndUpdateBase.callCount).to.equal(2);
    expect(utils.switchToAndUpdateBase.args[0][0]).to.equal('origin');
    expect(utils.switchToAndUpdateBase.args[0][1]).to.equal('main');
    expect(utils.switchToAndUpdateBase.args[0][2]).to.equal('ns/cBranch');

    // check that we're merging all of the to's
    expect(utils.switchToAndUpdateBase.args[1][0]).to.equal('origin');
    expect(utils.switchToAndUpdateBase.args[1][1]).to.equal('main');
    expect(utils.switchToAndUpdateBase.args[1][2]).to.equal(undefined);

    // check deletion of local branch
    expect(git.deleteLocalBranch.callCount).to.equal(1);
    expect(git.deleteLocalBranch.args[0][0]).to.equal('ns/cBranch');

    // make sure we didn't push anything
    expect(git.push.callCount).to.equal(0);
  }));

  it('should finish the branch even if a workflow cannot be found', () => {
    utils.getWorkflow.resolves(undefined);
    return finish().then(() => {

      // check that we're updating the base
      expect(utils.switchToAndUpdateBase.callCount).to.equal(2);
      expect(utils.switchToAndUpdateBase.args[0][0]).to.equal('origin');
      expect(utils.switchToAndUpdateBase.args[0][1]).to.equal('main');
      expect(utils.switchToAndUpdateBase.args[0][2]).to.equal('ns/cBranch');

      // check that we're merging all of the to's
      expect(utils.switchToAndUpdateBase.args[1][0]).to.equal('origin');
      expect(utils.switchToAndUpdateBase.args[1][1]).to.equal('dBranch');
      expect(utils.switchToAndUpdateBase.args[1][2]).to.equal(undefined);

      // check deletion of local branch
      expect(git.deleteLocalBranch.callCount).to.equal(1);
      expect(git.deleteLocalBranch.args[0][0]).to.equal('ns/cBranch');

      // make sure we didn't push anything
      expect(git.push.callCount).to.equal(0);
    });
  });

  it('should finish the branch for multiple branches', () => {
    utils.getWorkflow.resolves({to: [ 'main', 'develop' ]});
    return finish().then(() => {

      // check that we're updating the base
      expect(utils.switchToAndUpdateBase.callCount).to.equal(3);
      expect(utils.switchToAndUpdateBase.args[0][0]).to.equal('origin');
      expect(utils.switchToAndUpdateBase.args[0][1]).to.equal('main');
      expect(utils.switchToAndUpdateBase.args[0][2]).to.equal('ns/cBranch');

      // check that we're merging all of the to's
      expect(utils.switchToAndUpdateBase.args[1][0]).to.equal('origin');
      expect(utils.switchToAndUpdateBase.args[1][1]).to.equal('main');
      expect(utils.switchToAndUpdateBase.args[1][2]).to.equal(undefined);
      expect(utils.switchToAndUpdateBase.args[2][0]).to.equal('origin');
      expect(utils.switchToAndUpdateBase.args[2][1]).to.equal('develop');
      expect(utils.switchToAndUpdateBase.args[2][2]).to.equal(undefined);


      // check deletion of local branch
      expect(git.deleteLocalBranch.callCount).to.equal(1);
      expect(git.deleteLocalBranch.args[0][0]).to.equal('ns/cBranch');

      // make sure we didn't push anything
      expect(git.push.callCount).to.equal(0);
    });
  });

  it('should finish the branch for multiple branches and push each one', () => {
    utils.getWorkflow.resolves({to: [ 'main', 'develop' ]});
    utils.shouldPush.returns(true);
    return finish().then(() => {

      // check that we're updating the base
      expect(utils.switchToAndUpdateBase.callCount).to.equal(3);
      expect(utils.switchToAndUpdateBase.args[0][0]).to.equal('origin');
      expect(utils.switchToAndUpdateBase.args[0][1]).to.equal('main');
      expect(utils.switchToAndUpdateBase.args[0][2]).to.equal('ns/cBranch');

      // check that we're merging all of the to's
      expect(utils.switchToAndUpdateBase.args[1][0]).to.equal('origin');
      expect(utils.switchToAndUpdateBase.args[1][1]).to.equal('main');
      expect(utils.switchToAndUpdateBase.args[1][2]).to.equal(undefined);
      expect(utils.switchToAndUpdateBase.args[2][0]).to.equal('origin');
      expect(utils.switchToAndUpdateBase.args[2][1]).to.equal('develop');
      expect(utils.switchToAndUpdateBase.args[2][2]).to.equal(undefined);


      // check deletion of local branch
      expect(git.deleteLocalBranch.callCount).to.equal(1);
      expect(git.deleteLocalBranch.args[0][0]).to.equal('ns/cBranch');

      // make sure we pushed everything including deleting the current branch
      expect(git.push.callCount).to.equal(3);
      expect(git.push.args[0][0]).to.equal('origin');
      expect(git.push.args[0][1]).to.equal('main');
      expect(git.push.args[1][0]).to.equal('origin');
      expect(git.push.args[1][1]).to.equal('develop');
      expect(git.push.args[2][0]).to.equal('origin');
      expect(git.push.args[2][1]).to.equal('ns/cBranch');
      expect(git.push.args[2][2]).to.deep.equal({'--delete': undefined});
    });
  });
});
