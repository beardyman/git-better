
// const wrapper = require('./shell-wrapper.spec');
// const update = require('../src/update');
//
// wrapper((argv) => update({logger: console.log, ...argv}));


const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised.default);
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();


describe('Bin Update', () => {
  let wrapper
    , sourceScript
    , scriptArgs;

  /**
   * Helper to load the script
   * @returns {*} - nothing
   */
  const loadScript = () => proxyquire('../../../bin/git-update', {
    './shell-wrapper': wrapper,
    '../src/update': sourceScript
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
