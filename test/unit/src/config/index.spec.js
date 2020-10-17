
const chai = require('chai').use(require('chai-as-promised'));
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

  beforeEach (() => {
    git = {
      revparse: sinon.stub().resolves('repoPath')
    };

    os = {
      homedir: sinon.stub().returns('homedir')
    };

    fs = {
      existsSync: sinon.stub().returns(false),
      readdirSync: sinon.stub().returns(['ex1', 'ex2']),
      copyFileSync: sinon.stub()
    };

    userConfig = {home: 'config'};
    repoConfig = {repo: 'config'};
    config = proxyquire('../../../../src/config', {
      'simple-git/promise': ()=>git,
      'os': os,
      'fs': fs,
      'repoPath/.gwfrc': repoConfig,
      'homedir/.gwfrc': userConfig,
      './default': {this: 'is the default config'}
    });
  });

  describe('getConfig', () => {
    it('should get the default config if no other configs exist', () => {
      return config.getConfig().then((config)=>{
        expect(os.homedir.callCount).to.equal(1);
        expect(git.revparse.callCount).to.equal(1);
        expect(fs.existsSync.callCount).to.equal(2);
        expect(config).to.deep.equal({this: 'is the default config'});
      });
    });

    it('should combine the user config with the default', () => {
      fs.existsSync.onFirstCall().returns(true);
      return config.getConfig().then((config)=>{
        expect(os.homedir.callCount).to.equal(1);
        expect(git.revparse.callCount).to.equal(1);
        expect(fs.existsSync.callCount).to.equal(2);
        expect(config).to.deep.equal({home: 'config', this: 'is the default config'});
      });
    });

    it('should combine the repo config with the default', () => {
      fs.existsSync.onSecondCall().returns(true);
      return config.getConfig().then((config)=>{
        expect(os.homedir.callCount).to.equal(1);
        expect(git.revparse.callCount).to.equal(1);
        expect(fs.existsSync.callCount).to.equal(2);
        expect(config).to.deep.equal({repo: 'config', this: 'is the default config'});
      });
    });

    it('should combine the home config with the default and the repo config', () => {
      fs.existsSync.returns(true);
      return config.getConfig().then((config)=>{
        expect(os.homedir.callCount).to.equal(1);
        expect(git.revparse.callCount).to.equal(1);
        expect(fs.existsSync.callCount).to.equal(2);
        expect(config).to.deep.equal({home: 'config', repo: 'config', this: 'is the default config'});
      });
    });

    it('the repo config should overwrite the user config and the user config should overwrite the default', () => {
      userConfig = {config: 'home', this: 'is the user config'};
      repoConfig = {config: 'repo', some: 'other setting'};

      config = proxyquire('../../../../src/config', {
        'simple-git/promise': ()=>git,
        'os': os,
        'fs': fs,
        'repoPath/.gwfrc': repoConfig,
        'homedir/.gwfrc': userConfig,
        './default': {this: 'is the default config'}
      });

      fs.existsSync.returns(true);
      return config.getConfig().then((config)=>{
        expect(os.homedir.callCount).to.equal(1);
        expect(git.revparse.callCount).to.equal(1);
        expect(fs.existsSync.callCount).to.equal(2);
        expect(config).to.deep.equal({some:'other setting', config: 'repo', this: 'is the user config'});
      });
    });
  });

  describe('initialize', ()=> {
    it('should not overwrite a file that exists', () => {
      fs.existsSync.returns(true);
      return expect(config.initialize('ex1')).to.be.rejected.then((err) => {
        expect(fs.existsSync.callCount).to.equal(1);
        expect(err.message).to.match(/Config file already exists.*/);
      });
    });

    it('should return a friendly error that lists available examples if the one provided is not available', () => {
      return expect(config.initialize('exex')).to.be.rejected.then((err) => {
        expect(fs.existsSync.callCount).to.equal(1);
        expect(err.message).to.match(/An example by that name does not exist\. .* ex1, ex2/);
      });
    });

    it('should copy an example locally', () => {
      return config.initialize('ex1').then(() => {
        expect(fs.existsSync.callCount).to.equal(1);
        expect(fs.copyFileSync.callCount).to.equal(1);
        expect(fs.copyFileSync.args[0][1]).to.match(/repoPath.*/);
      });
    });

    it('should copy an example globally', () => {
      return config.initialize('ex1', {global: true}).then(() => {
        expect(fs.existsSync.callCount).to.equal(1);
        expect(fs.copyFileSync.callCount).to.equal(1);
        expect(fs.copyFileSync.args[0][1]).to.match(/homedir.*/);
      });
    });
  });
});
