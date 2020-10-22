
const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();


describe('Shell Wrapper', () => {
  let wrapper
    , notify
    , mainFunc;


  beforeEach(() => {
    mainFunc = sinon.stub().resolves();

    notify = sinon.stub();

    sinon.stub(console, 'error');
    sinon.stub(process, 'exit');

    wrapper = proxyquire('../../../bin/shell-wrapper', {
      'update-notifier': () => ({notify}),
      'minimist': sinon.stub().returns('demArgs')
    });
  });

  afterEach(() => {
    console.error.restore();
    process.exit.restore();
  });

  it('should wrap the main function and exit when it completes', () => wrapper(mainFunc).then(() => {
    expect(notify.callCount).to.equal(1);
    expect(mainFunc.callCount).to.equal(1);
    expect(mainFunc.args[0][0]).to.equal('demArgs');
    expect(console.error.callCount).to.equal(0);
    expect(process.exit.callCount).to.equal(1);
    expect(process.exit.args[0][0]).to.equal(0);
  }));

  it('should wrap the main function and exit with an error when it throws an error', () => {
    mainFunc.rejects({message: 'nope!'});

    return wrapper(mainFunc).then(() => {
      expect(notify.callCount).to.equal(1);
      expect(mainFunc.callCount).to.equal(1);
      expect(mainFunc.args[0][0]).to.equal('demArgs');
      expect(console.error.callCount).to.equal(1);
      expect(console.error.args[0][0]).to.equal('nope!');
      expect(process.exit.callCount).to.equal(1);
      expect(process.exit.args[0][0]).to.equal(255);
    });
  });
});
