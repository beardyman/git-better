
const argv = require('minimist')(process.argv.slice(2));

module.exports = (mainScript) => {
  mainScript(argv).then(()=>{
    process.exit(0);
  }).catch((err) =>{
    console.log(err.message);
    process.exit(255);
  });
};
