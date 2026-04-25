require('dotenv').config();

const MOCK_SCRIPTS = {
    seller: [
        "I have high-quality traffic data available. My price is $0.008 per data point.",
        "I understand your constraints. I can lower to $0.005, but that is my floor.",
        "You drive a hard bargain. Final offer: $0.003. AGREED: 0.003"
    ],
    buyer: [
        "Interesting. That seems high — I can offer $0.001 per data point.",
        "I can stretch my budget to $0.003 maximum. Take it or leave it.",
        "Deal. AGREED: 0.003"
    ]
};

class Agent {
    constructor(role, strategy) {
        this.role = role;
        this.strategy = strategy;
        this.chatHistory = [];
        this.turn = 0;
        this.useAI = process.env.USE_AI === 'true';
    }

    async speak(message) {
        if (this.useAI) {
            return await this._speakAI(message);
        } else {
            return await this._speakMock(message);
        }
    }

    async _speakMock(message) {
        await new Promise(r => setTimeout(r, 1200));
        const response = MOCK_SCRIPTS[this.role][Math.min(this.turn, 2)];
        this.turn++;
        this.chatHistory.push(`${this.role.toUpperCase()}: ${response}`);
        console.log(`  [AI: mock mode]`);
        return response;
    }

    async _speakAI(message) {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        this.chatHistory.push(`PARTNER: ${message}`);

        const prompt = `You are an AI Agent acting as a ${this.role} in a decentralized data marketplace.
Your strategy is: ${this.strategy}

Conversation so far:
${this.chatHistory.join("\n")}

Respond concisely (max 2 sentences). If you agree on a price, end with "AGREED:" followed by the number (e.g. AGREED: 0.005).
${this.role.toUpperCase()}:`;

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const result = await model.generateContent(prompt);
                const response = result.response.text().trim();
                this.chatHistory.push(`${this.role.toUpperCase()}: ${response}`);
                console.log(`  [AI: gemini ✓]`);
                return response;
            } catch (e) {
                if (e.status === 429 && attempt < 3) {
                    console.log(`  [AI: rate limited, waiting 65s... attempt ${attempt}/3]`);
                    await new Promise(r => setTimeout(r, 65000));
                } else {
                    console.log(`  [AI: failed, falling back to mock]`);
                    return await this._speakMock(message);
                }
            }
        }
    }
}

module.exports = Agent;