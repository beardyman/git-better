

const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();


describe('Bin Finish', () => {
  let wrapper
    , sourceScript
    , scriptArgs;

  /**
   * Helper to load the script
   * @returns {*} - nothing
   */
  const loadScript = () => proxyquire('../../../bin/git-finish', {
    './shell-wrapper': wrapper,
    '../src/finish': sourceScript
  });

  beforeEach(() => {
    scriptArgs = {'_': [ 'arg1' ]};

    wrapper = sinon.stub().yields(scriptArgs);
    sourceScript = sinon.stub();
  });


  it('should call the main script', () => {

    loadScript();
    expect(sourceScript.callCount).to.equal(1);
    expect(sourceScript.args[0][0]).to.deep.equal({logger: console.log, ...scriptArgs});
  });
});
