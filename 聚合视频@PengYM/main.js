$app.rotateDisabled = true;
// disable all logs
console.log = function() {}
const app = require('./scripts/app');
app.show();
