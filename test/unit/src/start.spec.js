
const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');


describe('Start', () => {
  let rename
    , getConfig;


  beforeEach(()=>{
    fromFullBranchName = sinon.stub();

    git = {
      checkoutBranch: sinon.stub().resolves(),
      deleteLocalBranch: sinon.stub().resolves(),
      push: sinon.stub().resolves(),
      branch: sinon.stub().resolves({current: 'ns/cBranch'}),
    };

    getConfig = sinon.stub().resolves({alwaysPush: false, defaultRemote: 'origin'});

    sinon.stub(console, 'log');

    rename = proxyquire('../../../src/start', {
      'simple-git/promise': () => git,
      './config': {getConfig},
      './model/branch': {fromFullBranchName},
      './utils': {}
    });
  });

  afterEach(() => {
    console.log.restore();
  });

});
