/**
 * CIRCLE AGENTIC MARKETPLACE - MAIN ENTRY POINT
 * This script orchestrates AI negotiation and automated 
 * blockchain settlement via Circle Arc infrastructure.
 */

const Agent = require('./Agent.js');
const { batchPayments } = require('./payment.js'); 
require('dotenv').config();

async function runDemo() {
    console.clear();
    console.log("====================================================");
    console.log("   🌐 CIRCLE AGENTIC DATA MARKETPLACE DEMO   ");
    console.log("====================================================\n");

    // 1. Initialize Agents
    const seller = new Agent("seller", "High-quality IoT traffic data. Min price $0.003.");
    const buyer = new Agent("buyer", "Limited budget for data. Goal price: $0.002 - $0.004.");

    console.log("🤖 [Step 1] Initiating AI Negotiation Layer...");
    
    let currentMessage = "Hello, I am interested in your IoT data stream. What's your current rate?";
    let finalPrice = 0;

    // Negotiation Loop (Limit to 6 exchanges)
    for (let i = 0; i < 6; i++) {
        // Seller's turn
        currentMessage = await seller.speak(currentMessage);
        console.log(`\x1b[31m[SELLER]\x1b[0m: ${currentMessage}`);
        if (currentMessage.includes("AGREED:")) break;

        // Buyer's turn
        currentMessage = await buyer.speak(currentMessage);
        console.log(`\x1b[34m[BUYER]\x1b[0m: ${currentMessage}`);
        if (currentMessage.includes("AGREED:")) break;
    }

    // 2. Parse Agreement
    const match = currentMessage.match(/AGREED:\s*(\d+\.?\d*)/);
    
    if (match) {
        finalPrice = parseFloat(match[1]);
        console.log("\n----------------------------------------------------");
        console.log(`💰 DEAL REACHED: $${finalPrice} USDC per data point`);
        console.log("----------------------------------------------------\n");

        // 3. Execution Phase
        console.log("🚀 [Step 2] Executing Automated Settlement on Arc Testnet...");
        try {
            // We simulate a batch of 10 micro-payments based on the negotiated price
            await batchPayments(10, finalPrice);
            
            console.log("\n✨ DEMO SUCCESSFUL: Agent interaction settled on-chain.");
        } catch (error) {
            console.error("\n❌ Settlement failed:", error.message);
        }
    } else {
        console.log("\n❌ No consensus reached. Transaction aborted.");
    }
    
    console.log("\n====================================================");
}

// Global error handler
runDemo().catch(err => {
    console.error("Critical Demo Error:", err);
});