
const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');


describe('Utils', () => {
  let utils
    , getConfig
    , git;


  beforeEach(() => {
    git = {
      status: sinon.stub().resolves({modified: ''}),
      checkout: sinon.stub().resolves(),
      checkoutBranch: sinon.stub().resolves(),
      deleteLocalBranch: sinon.stub().resolves(),
      pull: sinon.stub().resolves(),
      push: sinon.stub().resolves(),
      branch: sinon.stub().resolves({current: 'ns/cBranch'})
    };

    getConfig = sinon.stub().resolves({alwaysPush: false, defaultRemote: 'origin'});

    sinon.stub(console, 'log');

    utils = proxyquire('../../../src/utils', {
      'simple-git/promise': () => git,
      './config': {getConfig}
    });
  });

  afterEach(() => {
    console.log.restore();
  });

  describe('isClean', () => {
    it('should be clean', async() => {
      expect(await utils.isClean()).to.equal(true);
    });

    it('should not be clean', async() => {
      git.status.resolves({modified: '1'});
      expect(await utils.isClean()).to.equal(false);
    });
  });

  describe('switchToAndUpdateBase', () => {
    it('should update the base branch', async() => {
      await utils.switchToAndUpdateBase('origin', 'base');
      expect(git.pull.callCount).to.equal(1);
      expect(git.checkout.callCount).to.equal(1);
      expect(git.checkout.args[0][0]).to.equal('base');
      expect(git.pull.args[0][0]).to.equal('origin');
      expect(git.pull.args[0][1]).to.equal('base');
    });

    it('should update the base branch and switch back to the current branch', async() => {
      await utils.switchToAndUpdateBase('origin', 'base', 'current');
      expect(git.pull.callCount).to.equal(1);
      expect(git.checkout.callCount).to.equal(2);
      expect(git.checkout.args[0][0]).to.equal('base');
      expect(git.pull.args[0][0]).to.equal('origin');
      expect(git.pull.args[0][1]).to.equal('base');
      expect(git.checkout.args[1][0]).to.equal('current');
    });
  });
});
