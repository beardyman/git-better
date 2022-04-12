
const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;
const proxyquire = require('proxyquire');
const sinon = require('sinon');


describe('Git Pr', () => {
  let main, git, open, utils, fromFullBranchName, getConfig;

  beforeEach(() => {
    open = sinon.stub();
    sinon.stub(console, 'log');

    fromFullBranchName = sinon.stub().returns('ns/cBranch');

    getConfig = sinon.stub().resolves({defaultBase: 'ace'});

    git = {
      branch: sinon.stub().resolves({}),
      push: sinon.stub().resolves()
    };

    utils = {
      shouldPush: sinon.stub().returns(false),
      getUiUrl: sinon.stub().resolves('Sweet URL'),
      getWorkflow: sinon.stub().resolves()
    };

    main = proxyquire('../../../src/pr', {
      'simple-git': () => git,
      './utils': utils,
      './model/branch': {fromFullBranchName},
      './config': {getConfig},
      open
    });
  });

  afterEach(() => {
    console.log.restore();
  });

  it('open but not notify the user when no logger is passed', () => main().then(() => {
    expect(console.log.callCount).to.equal(0);
    expect(open.callCount).to.equal(1);
    expect(open.args[0][0]).to.equal('Sweet URL/compare/ace...ns/cBranch?expand=1');
  }));

  it('should fail gracefully and notify the user', () => {
    utils.getUiUrl.resolves();
    return expect(main({logger: console.log})).to.be.rejected.then((err) => {
      expect(err.message).to.equal('Could not determine remote UI URL');
    });
  });

  it('should open the URL if its found', () => main({logger: console.log}).then(() => {
    expect(console.log.args[0][0]).to.equal('Opening Sweet URL/compare/ace...ns/cBranch?expand=1...');
    expect(open.args[0][0]).to.equal('Sweet URL/compare/ace...ns/cBranch?expand=1');
  }));

  it('should push local changes before opening the pr if needed', () => {
    utils.shouldPush.returns(true);
    return main({logger: console.log}).then(() => {
      expect(console.log.args[0][0]).to.equal('Opening Sweet URL/compare/ace...ns/cBranch?expand=1...');
      expect(git.push.callCount).to.equal(1);
      expect(open.args[0][0]).to.equal('Sweet URL/compare/ace...ns/cBranch?expand=1');
    });
  });

  it('should open all URLs if there are multiple tos in the workflow', () => {
    utils.getWorkflow.resolves({to: [ 'ace', 'of', 'base' ]});

    return main({logger: console.log}).then(() => {
      expect(open.callCount).to.equal(3);

      expect(console.log.args[0][0]).to.equal('Opening Sweet URL/compare/ace...ns/cBranch?expand=1...');
      expect(open.args[0][0]).to.equal('Sweet URL/compare/ace...ns/cBranch?expand=1');

      expect(console.log.args[1][0]).to.equal('Opening Sweet URL/compare/of...ns/cBranch?expand=1...');
      expect(open.args[1][0]).to.equal('Sweet URL/compare/of...ns/cBranch?expand=1');

      expect(console.log.args[2][0]).to.equal('Opening Sweet URL/compare/base...ns/cBranch?expand=1...');
      expect(open.args[2][0]).to.equal('Sweet URL/compare/base...ns/cBranch?expand=1');
    });
  });
});
