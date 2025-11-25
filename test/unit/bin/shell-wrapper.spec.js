
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised.default);
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();


describe('Shell Wrapper', () => {
  let wrapper
    , notify
    , mainFunc
    , argv;


  beforeEach(() => {
    mainFunc = sinon.stub().resolves();

    notify = sinon.stub();

    sinon.stub(console, 'error');
    sinon.stub(process, 'exit');

    argv = sinon.stub().returns({'_': []});

    wrapper = proxyquire('../../../bin/shell-wrapper', {
      'update-notifier': () => ({notify}),
      'minimist': argv
    });
  });

  afterEach(() => {
    console.error.restore();
    process.exit.restore();
  });

  it('should wrap the main function and exit when it completes', () => wrapper(mainFunc).then(() => {
    expect(notify.callCount).to.equal(1);
    expect(mainFunc.callCount).to.equal(1);
    expect(mainFunc.args[0][0]).to.deep.equal({'_': []});
    expect(console.error.callCount).to.equal(0);
    expect(process.exit.callCount).to.equal(1);
    expect(process.exit.args[0][0]).to.equal(0);
  }));

  it('should wrap the main function and exit with an error when it throws an error', () => {
    mainFunc.rejects({message: 'nope!'});

    return wrapper(mainFunc).then(() => {
      expect(notify.callCount).to.equal(1);
      expect(mainFunc.callCount).to.equal(1);
      expect(mainFunc.args[0][0]).to.deep.equal({'_': []});
      expect(console.error.callCount).to.equal(1);
      expect(console.error.args[0][0]).to.equal('nope!');
      expect(process.exit.callCount).to.equal(1);
      expect(process.exit.args[0][0]).to.equal(255);
    });
  });


  describe('push', () => {
    beforeEach(() => {
      notify = sinon.stub();
      argv.returns({'_': [ 'push' ]});

      // need to re-proxyquire because argv gets evaluated on require of the file
      wrapper = proxyquire('../../../bin/shell-wrapper', {
        'update-notifier': () => ({notify}),
        'minimist': argv
      });
    });

    it('should work with `--push` or just `push`', () => {
      const expectedArgs = {'_': [ 'push' ], push: true, p: true}; // eslint-disable-line id-length

      return wrapper(mainFunc).then(() => {
        expect(notify.callCount, 'notify').to.equal(1);
        expect(mainFunc.callCount).to.equal(1);
        expect(mainFunc.args[0][0]).to.deep.equal(expectedArgs);
        expect(console.error.callCount).to.equal(0);
        expect(process.exit.callCount).to.equal(1);
        expect(process.exit.args[0][0]).to.equal(0);
      });
    });
  });
});
