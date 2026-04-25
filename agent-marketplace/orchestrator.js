const Agent = require('./Agent');
const { batchPayments } = require('./payment'); //  payment.js

async function startNegotiation() {
    console.log(" Starting AI Negotiation...");

    const seller = new Agent("seller", "Sell traffic data. Min price 0.001. Ask for 0.01.");
    const buyer = new Agent("buyer", "Tight budget. Max 0.003.");

    let currentMessage = "Hello, I am interested in your data. What is the price?";
    let finalPrice = 0;

    for (let i = 0; i < 5; i++) {
    // Seller
    currentMessage = await seller.speak(currentMessage);
    console.log(`SELLER: ${currentMessage}`);
    if (currentMessage.includes("AGREED:")) break;
    
    await new Promise(r => setTimeout(r, 5000)); 

    // Buyer
    currentMessage = await buyer.speak(currentMessage);
    console.log(`BUYER: ${currentMessage}`);
    if (currentMessage.includes("AGREED:")) break;

    await new Promise(r => setTimeout(r, 5000)); 
}

    const match = currentMessage.match(/AGREED:\s*(\d+\.?\d*)/);
    if (match) {
        finalPrice = parseFloat(match[1]);
        console.log(`\n DEAL REACHED: $${finalPrice} USDC`);
        
        
        console.log(`Executing blockchain settlement...`);
        await batchPayments(10, finalPrice); 
    } else {
        console.log("\n No deal reached.");
    }
}

startNegotiation();
