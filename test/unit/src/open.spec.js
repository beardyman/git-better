
const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;
const proxyquire = require('proxyquire');
const sinon = require('sinon');


describe('Git Open', () => {
  let main, git, open, utils;

  beforeEach(() => {
    open = sinon.stub();
    sinon.stub(console, 'log');

    git = {
      branch: sinon.stub().resolves()
    };

    utils = {
      getUiUrl: sinon.stub().resolves('Sweet URL')
    };

    main = proxyquire('../../../src/open', {
      'simple-git/promise': () => git,
      './utils': utils,
      open
    });
  });

  afterEach(() => {
    console.log.restore();
  });

  it('open but not notify the user when no logger is passed', () => main().then(() => {
    expect(console.log.callCount).to.equal(0);
    expect(open.callCount).to.equal(1);
    expect(open.args[0][0]).to.equal('Sweet URL');
  }));

  it('should fail gracefully and notify the user', () => {
    utils.getUiUrl.resolves();
    return expect(main({logger: console.log})).to.be.rejected.then((err) => {
      expect(err.message).to.equal('Could not determine remote UI URL');
    });
  });

  it('should open the URL if its found', () => main({logger: console.log}).then(() => {
    expect(console.log.args[0][0]).to.equal('Opening Sweet URL...');
    expect(open.args[0][0]).to.equal('Sweet URL');
  }));

  it('should handle the branch flag parameter', () => {
    git.branch.resolves({current: 'branchy'});
    return main({branch: true, logger: console.log}).then(() => {
      expect(console.log.args[0][0]).to.equal('Opening Sweet URL/tree/branchy...');
      expect(open.callCount).to.equal(1);
      expect(open.args[0][0]).to.equal('Sweet URL/tree/branchy');
    });
  });
});
