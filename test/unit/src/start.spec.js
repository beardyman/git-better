
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised.default);
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();


describe('Start', () => {
  let start
    , getConfig
    , utils
    , git;


  beforeEach(() => {
    git = {
      checkoutBranch: sinon.stub().resolves()
    };

    utils = {
      isClean: sinon.stub().resolves(true),
      getBaseBranch: sinon.stub().resolves('baseBranch'),
      getRemote: sinon.stub().returns('origin'),
      switchToAndUpdateBase: sinon.stub().resolves()
    };

    getConfig = sinon.stub().resolves();

    sinon.stub(console, 'log');

    start = proxyquire('../../../src/start', {
      'simple-git': () => git,
      './config': {getConfig},
      './utils': utils
    });
  });

  afterEach(() => {
    console.log.restore();
  });

  it('should throw an error if the current branch is not clean', () => {
    utils.isClean.returns(false);
    return expect(start('branch')).to.be.rejected.then((err) => {
      expect(err.message).to.match(/Current workspace is not clean.*/);
    });
  });

  it('should start a new branch', () => start('branch').then(() => {

    // check that we update the base branch
    expect(utils.switchToAndUpdateBase.callCount).to.equal(1);
    expect(utils.switchToAndUpdateBase.args[0][0]).to.equal('origin');
    expect(utils.switchToAndUpdateBase.args[0][1]).to.equal('baseBranch');

    // checkout the new branch!
    expect(git.checkoutBranch.callCount).to.equal(1);
    expect(git.checkoutBranch.args[0][0]).to.equal('branch');
    expect(git.checkoutBranch.args[0][1]).to.equal('baseBranch');
  }));

});
