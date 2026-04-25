const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
require('dotenv').config();
const fs = require('fs');

// initializes client with .env names
const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET,
});

async function createWallets() {
  console.log('Create wallets on Arc Testnet...');
  
  try {
    // 1. Set Wallet, (the container for wallets)
    const set = await client.createWalletSet({ name: "Hackathon Set" });
    const setId = set.data.walletSet.id;

    // 2. Create the 2 wallets, buyer+seller
    // SCA (Smart Contract Account)  optim for Arc
    const response = await client.createWallets({
      accountType: 'SCA', 
      blockchains: ['ARC-TESTNET'],
      count: 2,
      walletSetId: setId
    });

    // 3. extract the data and set them up for saving
    const wallets = {
      buyer: { 
        id: response.data.wallets[0].id, 
        address: response.data.wallets[0].address 
      },
      seller: { 
        id: response.data.wallets[1].id, 
        address: response.data.wallets[1].address 
      }
    };

    // 4. save them into json (so we dont lose em haha)
    fs.writeFileSync('wallets.json', JSON.stringify(wallets, null, 2));

    console.log('\n wallets created and saved in jason format!');
    console.log('--------------------------------------------------');
    console.log('BUYER ADDRESS:  ', wallets.buyer.address);
    console.log('SELLER ADDRESS: ', wallets.seller.address);
    console.log('--------------------------------------------------');
    console.log('\n👉 PASUL URMĂTOR (Hour 2):');
    console.log('1. Mergi la https://faucet.circle.com');
    console.log('2. Alege "Arc Testnet" și bagă adresa BUYER de mai sus.');

  } catch (error) {
    console.error('❌ Eroare la crearea portofelelor:', error.response?.data || error.message);
  }
}

createWallets();