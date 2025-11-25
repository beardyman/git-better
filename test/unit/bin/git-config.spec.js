
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised.default);
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();


describe('Bin Config', () => {
  let wrapper
    , sourceScript
    , scriptArgs;

  /**
   * Helper to load the script
   * @returns {*} - nothing
   */
  const loadScript = () => proxyquire('../../../bin/git-config', {
    './shell-wrapper': wrapper,
    '../src/config': {initialize: sourceScript}
  });

  beforeEach(() => {
    scriptArgs = {'_': [ 'arg1' ]};

    wrapper = sinon.stub().yields(scriptArgs);
    sourceScript = sinon.stub();
  });


  it('should call the main script', () => {

    loadScript();
    expect(sourceScript.callCount).to.equal(1);
    expect(sourceScript.args[0][0]).to.equal('arg1');
    expect(sourceScript.args[0][1]).to.deep.equal({logger: console.log, ...scriptArgs});
  });
});
