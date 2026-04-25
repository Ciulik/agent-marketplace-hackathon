const crypto =require('crypto');

//generating the code
const entitySecret = crypto.randomBytes(32).toString('hex');

console.log("my secret entity code");
console.log(entitySecret);
