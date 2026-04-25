const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
require('dotenv').config();

const wallets = JSON.parse(fs.readFileSync('wallets.json'));
const API_KEY = process.env.CIRCLE_API_KEY;
const ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET;

async function getPublicKey() {
  const response = await axios.get('https://api.circle.com/v1/w3s/config/entity/publicKey', {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });
  console.log('Public key response:', JSON.stringify(response.data, null, 2));
  return response.data.data.publicKey;
}

async function generateCiphertext(publicKeyPem) {
  // Circle uses RSA-OAEP with SHA-256, switched to it bcs of problems with SDK
  const entitySecretBuffer = Buffer.from(ENTITY_SECRET, 'hex');
  
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    entitySecretBuffer
  );
  
  return encrypted.toString('base64');
}

async function sendPayment(ciphertext, tokenId, amount, index, total) {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.circle.com/v1/w3s/developer/transactions/transfer',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      data: {
        idempotencyKey: crypto.randomBytes(16).toString('hex'),
        walletId: wallets.buyer.id,
        tokenId: tokenId,
        destinationAddress: wallets.seller.address,
        amounts: [amount.toString()],
        feeLevel: 'LOW',
        entitySecretCiphertext: ciphertext
      }
    });

    const txId = response.data?.data?.id || JSON.stringify(response.data);
    console.log(` Payment ${index}/${total} | tx: ${txId}`);
    return response.data;

  } catch (error) {
    console.error(` Payment ${index}/${total}:`, JSON.stringify(error.response?.data || error.message));
    return null;
  }
}

async function batchPayments(count = 10, pricePerUnit = 0.001) {
  console.log(' Fetching Circle public key...');
  
  const publicKey = await getPublicKey();
  console.log(' Public key obtained');

  const TOKEN_ID = '15dc2b5d-0994-58b0-bf8c-3a0501148ee8';
  
  console.log(`\n Starting ${count} payments at $${pricePerUnit} each...\n`);

  const results = [];
  const start = Date.now();

  for (let i = 1; i <= count; i++) {
    // generates ciphertext for every new transaction
    const ciphertext = await generateCiphertext(publicKey);
    const result = await sendPayment(ciphertext, TOKEN_ID, pricePerUnit, i, count);
    if (result) results.push(result);
    await new Promise(r => setTimeout(r, 700));
  }

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  const ethCost = (count * 2.50).toFixed(2);
  const arcCost = (count * 0.0001).toFixed(4);

  console.log(`\n--- ECONOMIC REPORT ---`);
  console.log(`Status:          ${results.length}/${count} transactions OK`);
  console.log(`Duration:        ${duration}s`);
  console.log(`Ethereum cost:   $${ethCost}`);
  console.log(`Arc cost:        $${arcCost}`);
  console.log(`Savings:         $${(parseFloat(ethCost) - parseFloat(arcCost)).toFixed(2)}`);
  console.log(`-----------------------\n`);

  fs.writeFileSync('transactions.json', JSON.stringify({ results }, null, 2));
}

module.exports = { batchPayments, sendPayment };