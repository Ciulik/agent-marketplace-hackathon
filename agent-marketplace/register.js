const { registerEntitySecretCiphertext } = require('@circle-fin/developer-controlled-wallets');
require('dotenv').config();

async function run() {
  console.log("regestering circle secret");
  try {
    await registerEntitySecretCiphertext({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET
    });
    console.log(" Secret successfuly recorded");
  } catch (error) {
    // err
    console.error("error at sign up");
    console.error(error.response?.data || error.message);
  }
}

run();