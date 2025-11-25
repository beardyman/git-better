
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised.default);
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();



describe('Config', () => {
  let config
    , git
    , os
    , fs
    , userConfig
    , repoConfig;

  /**
   * Helper to initialize the mocked config lib
   *
   * @returns {*} - config helper object, not the config itself as you would get from config.get()
   */
  function initializeConfig() {
    return proxyquire('../../../../src/config', {
      'simple-git': () => git,
      os,
      fs,
      'repoPath/.gbrc': repoConfig,
      'homedir/.gbrc': userConfig,
      './default': {this: 'is the default config'}
    });
  }

  beforeEach(() => {
    git = {
      revparse: sinon.stub().resolves('repoPath')
    };

    os = {
      homedir: sinon.stub().returns('homedir')
    };

    fs = {
      writeFileSync: sinon.stub(),
      existsSync: sinon.stub().returns(false),
      readdirSync: sinon.stub().returns([ 'ex1', 'ex2' ]),
      copyFileSync: sinon.stub()
    };

    userConfig = {home: 'config'};
    repoConfig = {repo: 'config'};
    config = initializeConfig();
  });

  describe('getConfig', () => {
    it('should get the default config if no other configs exist', () => {
      userConfig = new Error();
      repoConfig = new Error();
      config = initializeConfig();
      return config.getConfig().then((config) => {
        expect(os.homedir.callCount).to.equal(1);
        expect(git.revparse.callCount).to.equal(1);
        expect(config).to.deep.equal({this: 'is the default config'});
      });
    });

    it('should combine the user config with the default', () => {
      repoConfig = new Error();
      config = initializeConfig();
      return config.getConfig().then((config) => {
        expect(os.homedir.callCount).to.equal(1);
        expect(git.revparse.callCount).to.equal(1);
        expect(config).to.deep.equal({home: 'config', this: 'is the default config'});
      });
    });

    it('should combine the repo config with the default', () => {
      userConfig = new Error();
      config = initializeConfig();
      return config.getConfig().then((config) => {
        expect(os.homedir.callCount).to.equal(1);
        expect(git.revparse.callCount).to.equal(1);
        expect(config).to.deep.equal({repo: 'config', this: 'is the default config'});
      });
    });

    it('should combine the home config with the default and the repo config', () => config.getConfig()
      .then((config) => {
        expect(os.homedir.callCount).to.equal(1);
        expect(git.revparse.callCount).to.equal(1);
        expect(config).to.deep.equal({home: 'config', repo: 'config', this: 'is the default config'});
      }));

    it('should return the same config each time', () => config.getConfig()
      .then((conf1) => {
        expect(conf1).to.deep.equal({home: 'config', repo: 'config', this: 'is the default config'});
        return config.getConfig().then((conf2) => {
          expect(os.homedir.callCount).to.equal(1);
          expect(git.revparse.callCount).to.equal(1);
          expect(conf1).to.deep.equal(conf2);
        });
      })
    );

    it('the repo config should overwrite the user config and the user config should overwrite the default', () => {
      userConfig = {config: 'home', this: 'is the user config'};
      repoConfig = {config: 'repo', some: 'other setting'};

      // re-initialize since we changed things
      config = initializeConfig();

      fs.existsSync.returns(true);
      return config.getConfig().then((config) => {
        expect(os.homedir.callCount).to.equal(1);
        expect(git.revparse.callCount).to.equal(1);
        expect(config).to.deep.equal({some: 'other setting', config: 'repo', this: 'is the user config'});
      });
    });
  });

  describe('initialize', () => {
    it('should not overwrite a file that exists', () => {
      fs.existsSync.returns(true);
      return expect(config.initialize('ex1')).to.be.rejected.then((err) => {
        expect(fs.existsSync.callCount).to.equal(1);
        expect(err.message).to.match(/Config file already exists.*/);
      });
    });

    it('should return a friendly error that lists available examples if the one provided is not available',
      () => expect(config.initialize('exex')).to.be.rejected.then((err) => {
        expect(fs.existsSync.callCount).to.equal(1);
        expect(err.message).to.match(/An example by that name does not exist\. .* ex1, ex2/);
      }));

    it('should copy an example locally', () => config.initialize('ex1').then(() => {
      expect(fs.existsSync.callCount).to.equal(1);
      expect(fs.copyFileSync.callCount).to.equal(1);
      expect(fs.copyFileSync.args[0][1]).to.match(/repoPath.*/);
    }));

    it('should copy an example globally', () => config.initialize('ex1', {global: true}).then(() => {
      expect(fs.existsSync.callCount).to.equal(1);
      expect(fs.copyFileSync.callCount).to.equal(1);
      expect(fs.copyFileSync.args[0][1]).to.match(/homedir.*/);
    }));

    it('should just make a blank config if there is no example', () => config.initialize().then(() => {
      expect(fs.existsSync.callCount).to.equal(1);
      expect(fs.writeFileSync.callCount).to.equal(1);
      expect(fs.writeFileSync.args[0][0]).to.match(/repoPath.*/);
      expect(fs.writeFileSync.args[0][1]).to.equal('{\n\n}');
    }));
  });
});
