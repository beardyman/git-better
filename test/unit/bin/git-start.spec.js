
const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();


describe('Bin Start', () => {
  let wrapper
    , sourceScript
    , scriptArgs
    , fromFullBranchName;

  /**
   * Helper to load the script
   * @returns {*} - nothing
   */
  const loadScript = () => proxyquire('../../../bin/git-start', {
    './shell-wrapper': wrapper,
    '../src/start': sourceScript,
    '../src/model/branch': {fromFullBranchName}
  });

  beforeEach(() => {
    scriptArgs = {'_': [ 'arg1' , 'arg2' ]};

    fromFullBranchName = sinon.stub().returns('a/b');
    wrapper = sinon.stub().yields(scriptArgs);
    sourceScript = sinon.stub();
  });


  it('should call the main script', () => {

    loadScript();
    expect(sourceScript.callCount).to.equal(1);
    expect(sourceScript.args[0][0]).to.equal('a/b');
    expect(sourceScript.args[0][1]).to.deep.equal(scriptArgs);
  });
});
