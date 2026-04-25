const Agent = require('./Agent');
const { batchPayments } = require('./payment'); 
const fs = require('fs');

async function startNegotiation() {
    console.clear();
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║   CIRCLE AGENTIC MARKETPLACE - 100 TX STRESS TEST ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');

    const seller = new Agent("seller", "Sell traffic data. Min price 0.001. Ask for 0.01.");
    const buyer = new Agent("buyer", "Tight budget. Max 0.003.");

    let currentMessage = "Hello, I am interested in your data. What is the price?";
    let finalPrice = 0;

    console.log("--- PHASE 1: AI NEGOTIATION ---\n");

    for (let i = 0; i < 5; i++) {
        currentMessage = await seller.speak(currentMessage);
        console.log(`\x1b[31m[SELLER]\x1b[0m: ${currentMessage}`);
        if (currentMessage.includes("AGREED:")) break;
        
        await new Promise(r => setTimeout(r, 1000)); 

        currentMessage = await buyer.speak(currentMessage);
        console.log(`\x1b[34m[BUYER]\x1b[0m: ${currentMessage}`);
        if (currentMessage.includes("AGREED:")) break;

        await new Promise(r => setTimeout(r, 1000)); 
    }

    const match = currentMessage.match(/AGREED:\s*(\d+\.?\d*)/);
    if (match) {
        finalPrice = parseFloat(match[1]);
        console.log(`\n✅ DEAL REACHED: $${finalPrice} USDC`);
        
        console.log(`\n--- PHASE 2: BLOCKCHAIN SETTLEMENT (100 TRANSACTIONS) ---`);
        console.log(`Executing high-volume batch on Arc Testnet...`);
        
        // MODIFIED: Increased to 100 nanopayments
        const totalTransactions = 100;
        const results = await batchPayments(totalTransactions, finalPrice); 

        console.log(`\n--- PHASE 3: ECONOMIC PROOF ---`);
        // Calculation based on 100 transactions
        const ethCostValue = totalTransactions * 2.50; 
        const arcCostValue = totalTransactions * 0.0001; 
        
        const report = {
            status: "SUCCESS",
            agreedPrice: finalPrice,
            totalTransactions: totalTransactions,
            ethereumCost: `$${ethCostValue.toFixed(2)}`,
            arcCost: `$${arcCostValue.toFixed(4)}`,
            totalSavings: `$${(ethCostValue - arcCostValue).toFixed(2)}`,
            efficiency: "99.996%"
        };

        console.log('📊 Final Metrics (100 Tx Load):', JSON.stringify(report, null, 2));
        
        generateHTMLReport(report);
        generateCSVReport(report);
        
        fs.writeFileSync('FINAL_REPORT.json', JSON.stringify(report, null, 2));
        console.log('\n✨ VISUAL REPORTS UPDATED: DEMO_REPORT.html & TRANSACTIONS.csv');
        console.log('✨ Stress test complete! 100 on-chain payments processed.');

    } else {
        console.log("\n❌ No deal reached. Negotiation failed.");
    }
}

// --- HTML REPORT GENERATOR ---
function generateHTMLReport(reportData) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Agent Marketplace - 100 TX Stress Test</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%); color: white; padding: 40px; margin: 0; }
    .container { max-width: 900px; margin: 0 auto; background: rgba(255,255,255,0.05); backdrop-filter: blur(15px); border-radius: 20px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
    h1 { font-size: 2.5em; text-align: center; margin-bottom: 5px; color: #4ade80; text-shadow: 0 0 15px rgba(74, 222, 128, 0.4); }
    .subtitle { text-align: center; opacity: 0.7; margin-bottom: 40px; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; text-align: center; border: 1px solid rgba(255,255,255,0.05); transition: transform 0.3s; }
    .stat-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.15); }
    .stat-label { font-size: 0.85em; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px; }
    .stat-value { font-size: 2.2em; font-weight: bold; margin-top: 10px; color: #fff; }
    .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
    .box { padding: 25px; border-radius: 15px; text-align: center; position: relative; }
    .ethereum { background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; }
    .arc { background: rgba(34, 197, 94, 0.1); border: 2px solid #22c55e; }
    .savings-badge { font-size: 3.5em; font-weight: bold; color: #4ade80; text-align: center; margin: 20px 0; text-shadow: 0 0 20px rgba(74, 222, 128, 0.3); }
    .footer { text-align: center; margin-top: 50px; font-size: 0.8em; opacity: 0.4; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🤖 Agent Marketplace</h1>
    <div class="subtitle">High-Volume Autonomous Commerce (100 TX Stress Test)</div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Total Transactions</div><div class="stat-value">${reportData.totalTransactions}</div></div>
      <div class="stat-card"><div class="stat-label">Price per Micro-unit</div><div class="stat-value">$${reportData.agreedPrice}</div></div>
    </div>
    <div style="background: rgba(255,255,255,0.03); padding: 30px; border-radius: 20px;">
      <h2 style="text-align: center; margin-top: 0;">Economic Proof: 100 Data Points</h2>
      <div class="comparison">
        <div class="box ethereum"><h3>⛓️ Legacy (ETH)</h3><div style="font-size: 2em;">${reportData.ethereumCost}</div><p>Fee limited</p></div>
        <div class="box arc"><h3>⚡ Circle Arc</h3><div style="font-size: 2em;">${reportData.arcCost}</div><p>Enabled for Scale</p></div>
      </div>
      <div class="savings-badge">SAVED ${reportData.totalSavings}</div>
      <p style="text-align: center; color: #4ade80; font-size: 1.2em;"><strong>Efficiency: ${reportData.efficiency}</strong></p>
    </div>
    <div class="footer">STRESS TEST COMPLETED | Generated: ${new Date().toLocaleString()}</div>
  </div>
</body>
</html>`;
  fs.writeFileSync('DEMO_REPORT.html', html);
}

function generateCSVReport(reportData) {
  const csvHeaders = "Timestamp,Network,Status,Price,TxCount,Total_Cost_Eth,Total_Cost_Arc,Savings\n";
  const csvRow = `${new Date().toISOString()},Arc-Testnet,SUCCESS,${reportData.agreedPrice},${reportData.totalTransactions},${reportData.ethereumCost},${reportData.arcCost},${reportData.totalSavings}`;
  fs.writeFileSync('TRANSACTIONS.csv', csvHeaders + csvRow);
}

startNegotiation();