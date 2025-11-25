
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised.default);
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
      branch: sinon.stub().resolves({current: 'ns/cBranch'}),
      getRemotes: sinon.stub().resolves([{ name: 'origin', refs: {fetch: 'datRemote'}}])
    };

    getConfig = sinon.stub().resolves({
      alwaysPush: false,
      defaultBase: 'maiBase',
      defaultRemote: 'origin',
      workflows: {base: {from: 'baseConfigwf'}}
    });

    sinon.stub(console, 'log');

    utils = proxyquire('../../../src/utils', {
      'simple-git': () => git,
      './config': {getConfig}
    });
  });

  afterEach(() => {
    console.log.restore();
  });

  describe('getRemote', () => {
    it('should get the configured remote when none is passed as an option', () => {
      expect(utils.getRemote({defaultRemote: 'origin'})).to.equal('origin');
    });

    it('should get the passed remote when one is passed as an option', () => {
      expect(utils.getRemote({defaultRemote: 'origin'}, {remote: 'newRemote'})).to.equal('newRemote');
    });
  });

  describe('shouldPush', () => {
    it('should push when alwaysPush is configured', () => {
      expect(utils.shouldPush({alwaysPush: true})).to.equal(true);
    });

    it('should push when the user passes the option', () => {
      expect(utils.shouldPush({ alwaysPush: false }, {push: true})).to.equal(true);
    });

    it('should not push when its not configured to and the user doesn\'t pass the option', () => {
      expect(utils.shouldPush({ alwaysPush: false })).to.equal(false);
    });
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

  describe('getWorkflow', () => {
    it('should return a specific workflow from the config', async() => {
      expect(await utils.getWorkflow({namespace: 'test'}, {workflows: {test: 'testwf'}})).to.equal('testwf');
    });

    it('should return get the config and then return a specific workflow if the config is not passed', async() => {
      expect(await utils.getWorkflow({namespace: 'base'})).to.deep.equal({ from: 'baseConfigwf'});
    });

    it('should return nothing if the workflow cannot be found', async() => {
      expect(await utils.getWorkflow({namespace: 'blah'})).to.equal(undefined);
    });
  });

  describe('getBaseBranch', () => {
    it('should the default base branch when there isn\'t a workflow configured', async() => {
      expect(await utils.getBaseBranch({namespace: 'test'})).to.equal('maiBase');
    });

    it('it should return the base branch from the config when configured', async() => {
      expect(await utils.getBaseBranch({namespace: 'base'})).to.equal('baseConfigwf');
    });
  });

  describe('getAllBaseBranches', () => {
    it('should be return all base branches from promotion paths', async() => {
      expect(utils.getAllBaseBranches({promotionPaths: {'develop': 'master', 'thing': 'otherthing'}}))
        .to.deep.equal([ 'develop', 'thing', 'master', 'otherthing' ]);
    });

    it('should be return nothing if there are no promotion paths', async() => {
      expect(utils.getAllBaseBranches({}))
        .to.deep.equal([ ]);
    });

  });

  describe('getUiUrl', () => {
    it('should return the remote', () => utils.getUiUrl().then((result) => {
      expect(result).to.equal('datRemote');
    }));

    it('should handle ssh cloned urls', () => {
      git.getRemotes.resolves([{ name: 'origin', refs: {fetch: 'git@datUrl.com:withUser'}}]);

      return utils.getUiUrl().then((results) => {
        expect(results).to.equal('https://datUrl.com/withUser');
      });
    });
  });
});
