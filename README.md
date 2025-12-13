# WebXR Konseling AI - Backend

Backend API untuk aplikasi konseling berbasis WebXR dengan cerita Kiai Ahmad Dahlan.

## ✨ Features

- **AI-Powered Conversations**: Menggunakan Groq (Llama 3.1 70B) untuk percakapan yang natural
- **🧠 Chain of Thought (NEW!)**: Reasoning mendalam untuk empati yang lebih baik
- **Text-to-Speech**: ElevenLabs & LMNT untuk audio yang menenangkan
- **State Machine**: Flow konseling yang terstruktur
- **Session Management**: In-memory session storage
- **Personalized Stories**: Cerita Kiai Dahlan yang dipersonalisasi

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Environment Setup
Create `.env` file:
```env
PORT=3000
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-70b-versatile
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_voice_id
```

### Run Server
```bash
node src/app.js
```

## 🧠 Chain of Thought (CoT)

**NEW!** Kami telah mengimplementasikan Chain of Thought untuk meningkatkan kualitas percakapan.

### Endpoints

| Endpoint | Description | Use Case |
|----------|-------------|----------|
| `/chat` | Original endpoint | Fast, good quality |
| `/chat/cot` | **Chain of Thought** | Deep empathy, best quality |

### Benefits of CoT

✅ **Empati yang lebih spesifik** - Respons disesuaikan dengan konteks user  
✅ **Bahasa yang lebih natural** - Terasa seperti percakapan teman  
✅ **Koneksi cerita yang lebih dalam** - Personalisasi maksimal  
✅ **Konsistensi tone** - Selalu hangat dan supportif  

### Quick Example

```bash
# With Chain of Thought
curl -X POST http://localhost:3000/chat/cot \
  -H "Content-Type: application/json" \
  -d '{"sessionId": null, "state": "greeting", "payload": {}}'

# Original (for comparison)
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId": null, "state": "greeting", "payload": {}}'
```

**Learn More**: [CoT Quick Start](./COT-QUICKSTART.md) | [Full Documentation](./COT-IMPLEMENTATION.md)

## 📚 Documentation

- [API Documentation](./API-DOCUMENTATION.md) - Complete API reference
- [CoT Implementation](./COT-IMPLEMENTATION.md) - Chain of Thought details
- [CoT Quick Start](./COT-QUICKSTART.md) - Get started with CoT
- [CoT Comparison](./COT-COMPARISON.md) - Real-world examples
- [Benchmarking Guide](./BENCHMARKING-GUIDE.md) - Quality metrics & testing
- [Postman Collection](./postman-collection.json) - Original endpoints
- [Postman CoT Collection](./postman-cot-collection.json) - CoT endpoints

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌────────────────────┐     ┌─────────┐
│  Greeting   │ ──► │  Identify Topic │ ──► │ Collecting Problem │ ──► │  Story  │
│  (start)    │     │  (pilih topik)  │     │   (3x pilih)       │     │ (cerita)│
└─────────────┘     └─────────────────┘     └────────────────────┘     └─────────┘
```

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **AI**: Groq (Llama 3.1 70B)
- **TTS**: ElevenLabs / LMNT
- **Prompt Engineering**: Chain of Thought

## 📁 Project Structure

```
webxr-be/
├── src/
│   ├── app.js                      # Entry point
│   ├── routes/
│   │   ├── chat.routes.js          # Original chat endpoint
│   │   ├── chat-cot.routes.js      # 🧠 CoT chat endpoint
│   │   └── ...
│   ├── handlers/
│   │   ├── state.handlers.js       # Original handlers
│   │   ├── state-cot.handlers.js   # 🧠 CoT handlers
│   │   └── ...
│   ├── services/
│   │   ├── ai.service.js           # Original AI service
│   │   ├── ai-cot.service.js       # 🧠 CoT AI service
│   │   └── ...
│   └── ...
├── prompts/
│   ├── greetingprompt.js           # Original prompts
│   ├── cot-greetingprompt.js       # 🧠 CoT prompts
│   └── ...
├── data/
│   ├── topics.js                   # 3 topics + problems
│   └── basestories.js              # Kiai Dahlan stories
└── examples/
    └── test-cot.js                 # 🧠 CoT test script
```

## 🧪 Testing

### Quick Test
```bash
# Test Original Endpoint
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId": null, "state": "greeting", "payload": {}}'
```

### Test CoT Endpoint
```bash
curl -X POST http://localhost:3000/chat/cot \
  -H "Content-Type: application/json" \
  -d '{"sessionId": null, "state": "greeting", "payload": {}}'
```

### Run Test Script
```bash
# Full CoT flow test
node examples/test-cot.js

# Comparison test (CoT vs Original)
node examples/test-cot.js --compare
```

### 📊 Benchmarking & Quality Analysis

**NEW!** Comprehensive quality metrics untuk membandingkan CoT vs Non-CoT:

```bash
# Full benchmark (recommended)
node examples/benchmark-cot.js

# Quick comparison
node examples/benchmark-cot.js --quick

# Entropy/consistency test
node examples/benchmark-cot.js --entropy
```

**Metrics yang diukur**:
- ✅ **Empathy Score** (30%) - Kata-kata empati
- ✅ **Context Awareness** (25%) - Mengingat konteks sebelumnya
- ✅ **Naturalness** (20%) - Bahasa natural vs formal
- ✅ **Lexical Diversity** (15%) - Kekayaan vocabulary
- ✅ **Complexity** (10%) - Struktur kalimat

**Sample Output**:
```
┌─────────────────┬──────────────┬──────────────┬────────────┐
│ Metric          │ Original     │ CoT          │ Difference │
├─────────────────┼──────────────┼──────────────┼────────────┤
│ empathy         │         4.20 │         8.40 │ ↑    +4.20 │
│ context         │         2.00 │         6.00 │ ↑    +4.00 │
│ overall         │         4.58 │         7.68 │ ↑    +3.10 │
└─────────────────┴──────────────┴──────────────┴────────────┘

🏆 Winner: CoT
📈 Improvement: 67.69%
```

**Learn More**: [Benchmarking Guide](./BENCHMARKING-GUIDE.md)


## 📊 Performance

| Metric | Original `/chat` | CoT `/chat/cot` |
|--------|------------------|-----------------|
| Response Time | 1-2s | 2-4s |
| Token Usage | ~1,300/session | ~2,500/session |
| Quality | Good | Excellent |
| Empathy | Generic | Specific & Contextual |

**Recommendation**: Use `/chat/cot` for production, `/chat` for testing/development.

## 🎯 Use Cases

### Use `/chat/cot` when:
- Quality > Speed
- Deep empathy needed
- Personalization is critical
- Budget allows higher token usage

### Use `/chat` when:
- Speed > Quality
- Testing/Development
- Budget constrained
- High concurrent load

## 🔧 Configuration

### Groq Settings
```javascript
{
  model: "llama-3.1-70b-versatile",
  temperature: 0.7,
  max_tokens: 2048  // Higher for CoT
}
```

### TTS Settings
```javascript
{
  mode: "elevenlabs",  // or "lmnt"
  elevenlabs: {
    stability: 0.7,
    similarity_boost: 0.9
  }
}
```

## 📖 API Reference

### POST /chat (Original)
Standard chat endpoint without Chain of Thought.

### POST /chat/cot (Chain of Thought)
Enhanced chat endpoint with deep reasoning.

**Request**:
```json
{
  "sessionId": "uuid-or-null",
  "state": "greeting|identify_topic|collecting_problem|restart_session",
  "payload": {}
}
```

**Response**:
```json
{
  "sessionId": "abc123",
  "currentState": "identify_topic",
  "type": "topic_selection",
  "message": "...",
  "options": [...],
  "audio": {...},
  "cotEnabled": true  // Only in /chat/cot
}
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

ISC

## 👥 Team

WebXR Konseling AI Team

---

**Made with ❤️ and 🧠 Chain of Thought**
