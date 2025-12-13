# Chain of Thought Quick Start Guide

## 🚀 Quick Start

### 1. Pastikan Dependencies Terinstall
```bash
npm install
```

### 2. Setup Environment Variables
Pastikan `.env` sudah dikonfigurasi dengan API keys:
```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-70b-versatile
```

### 3. Jalankan Server
```bash
node src/app.js
```

### 4. Test CoT Endpoint

#### Test Greeting (dengan CoT)
```bash
curl -X POST http://localhost:3000/chat/cot \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": null,
    "state": "greeting",
    "payload": {}
  }'
```

#### Test Original (tanpa CoT) - untuk perbandingan
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": null,
    "state": "greeting",
    "payload": {}
  }'
```

---

## 🎯 Kapan Menggunakan CoT?

### ✅ Gunakan `/chat/cot` untuk:
- **Sesi konseling yang mendalam** - membutuhkan empati tinggi
- **Personalisasi maksimal** - setiap user mendapat respons unik
- **Kualitas > Kecepatan** - prioritas pada kualitas percakapan
- **Production dengan budget cukup** - siap dengan token usage lebih tinggi

### ✅ Gunakan `/chat` (original) untuk:
- **Testing & Development** - iterasi cepat
- **Budget terbatas** - hemat token usage
- **Response time kritis** - butuh respons cepat
- **Load tinggi** - banyak concurrent requests

---

## 📊 Perbandingan Response

### Contoh: Empati Kontekstual

**Scenario**: User memilih "Tekanan akademik" lalu "Krisis identitas"

**Original `/chat`**:
```
"Terima kasih sudah berbagi. Sekarang, pilih satu lagi yang terasa 
dekat dengan kondisimu..."
```

**CoT `/chat/cot`**:
```
"Aku bisa bayangin gimana rasanya... tekanan nilai dan tugas yang 
numpuk itu berat banget ya. Dan di tengah semua itu, kamu juga 
masih mencari tahu siapa diri kamu sebenarnya dan mau ke mana. 
Pasti nggak mudah... Selain dua hal tadi, ada satu lagi yang 
mungkin kamu rasakan?"
```

**Perbedaan**:
- CoT memberikan validasi spesifik untuk KEDUA pilihan
- Menunjukkan pemahaman mendalam tentang kondisi user
- Transisi lebih natural dan empatis

---

## 🔧 Advanced Usage

### Switching Between CoT and Non-CoT

Anda bisa menggunakan kedua endpoint dalam satu aplikasi:

```javascript
// Frontend code example
const endpoint = userNeedsDeepEmpathy 
  ? '/chat/cot'  // High quality, slower
  : '/chat';     // Fast, good quality

const response = await fetch(`${API_BASE}${endpoint}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId, state, payload })
});
```

### Monitoring CoT Usage

Check response untuk flag `cotEnabled`:

```javascript
const data = await response.json();
if (data.cotEnabled) {
  console.log('Response generated with Chain of Thought');
  // Maybe show a quality badge to user
}
```

---

## 📈 Performance Metrics

### Estimated Token Usage

| Endpoint | Greeting | Options | Story | Total/Session |
|----------|----------|---------|-------|---------------|
| `/chat` | ~200 | ~300 | ~800 | ~1,300 |
| `/chat/cot` | ~400 | ~600 | ~1,500 | ~2,500 |

**Note**: CoT menggunakan ~2x lebih banyak token, tapi menghasilkan kualitas signifikan lebih baik.

### Response Time

| Endpoint | Avg Response Time |
|----------|-------------------|
| `/chat` | 1-2 seconds |
| `/chat/cot` | 2-4 seconds |

**Note**: Waktu bervariasi tergantung load Groq API.

---

## 🐛 Troubleshooting

### Error: "Groq API error: 429"
**Cause**: Rate limit exceeded  
**Solution**: 
- Gunakan `/chat` untuk testing
- Implement request queuing
- Upgrade Groq plan

### Error: "JSON parse error"
**Cause**: AI tidak mengembalikan JSON valid  
**Solution**: 
- Sudah ada fallback ke data original
- Check logs untuk debug
- Adjust temperature jika perlu

### Response terlalu lambat
**Cause**: CoT membutuhkan lebih banyak processing  
**Solution**:
- Gunakan `/chat` untuk kasus yang tidak kritis
- Implement caching untuk pattern umum
- Consider async processing

---

## 📚 Learn More

- [Full Documentation](./COT-IMPLEMENTATION.md)
- [API Documentation](./API-DOCUMENTATION.md)
- [Prompt Engineering Guide](./prompts/)

---

**Happy Coding! 🎉**
