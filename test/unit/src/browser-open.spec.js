
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised.default);
const expect = chai.expect;


describe('Browser Open', () => {
  let browserOpen;

  beforeEach(() => {

    // Reset the module cache to ensure fresh state for each test
    delete require.cache[require.resolve('../../../src/browser-open')];
    browserOpen = require('../../../src/browser-open');
  });

  it('should return the open function when getOpen is called', async() => {
    const openFn = await browserOpen.getOpen();

    expect(openFn).to.be.a('function');
  });

  it('should cache the open module and not import multiple times', async() => {
    const openFn1 = await browserOpen.getOpen();
    const openFn2 = await browserOpen.getOpen();

    // Both calls should return the same function reference
    expect(openFn1).to.equal(openFn2);
  });
});
