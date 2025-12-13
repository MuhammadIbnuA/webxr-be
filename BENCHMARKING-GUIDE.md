# Benchmarking & Quality Analysis Guide

## 🎯 Overview

Karena Groq **belum mendukung logprobs**, kami menggunakan sistem analisis alternatif yang lebih comprehensive untuk membandingkan kualitas respons CoT vs Non-CoT.

## 📊 Metrics yang Digunakan

### 1. **Empathy Score** (30% weight)
Mengukur seberapa empatis respons berdasarkan kata-kata kunci:

**High Empathy Keywords** (3 points):
- "aku bisa bayangin", "aku ngerti", "pasti nggak mudah"
- "aku paham", "gimana rasanya", "terasa"

**Medium Empathy Keywords** (2 points):
- "mungkin", "kadang", "seperti", "bisa jadi"
- "merasa", "perasaan", "kondisi"

**Low Empathy Keywords** (1 point):
- "baik", "oke", "terima kasih", "silakan"

**Score Range**: 0-10 (normalized)

---

### 2. **Context Awareness Score** (25% weight)
Mengukur seberapa baik AI mengingat konteks sebelumnya:

**Context Phrases**:
- "yang kamu pilih tadi", "seperti yang kamu bilang"
- "sebelumnya", "dua hal", "di satu sisi, di sisi lain"
- "selain", "ditambah dengan"

**Score**: +2 points per phrase found (max 10)

---

### 3. **Naturalness Score** (20% weight)
Mengukur seberapa natural percakapan (bukan formal/robotic):

**Natural Markers** (positive):
- "ya", "kok", "sih", "kan", "dong", "deh"
- "gimana", "kayak", "banget", "nggak"

**Formal Phrases** (penalty -2 points):
- "sistem", "aplikasi", "platform", "AI"
- "terima kasih sudah", "baik, sekarang"

**Score**: Natural count - (Formal count × 2)

---

### 4. **Lexical Diversity** (15% weight)
Mengukur kekayaan vocabulary:

**Formula**: Unique words / Total words

**Interpretation**:
- 0.6-0.8: Good diversity
- 0.8-1.0: Excellent diversity
- <0.6: Repetitive

---

### 5. **Complexity Score** (10% weight)
Mengukur struktur kalimat:

**Optimal**:
- 10-15 words per sentence
- 4-6 characters per word

**Score**: Based on deviation from optimal

---

## 🧪 Running Benchmarks

### Full Benchmark (Recommended)
```bash
node examples/benchmark-cot.js
```

**What it does**:
- Tests all scenarios (Greeting, Topic Selection, etc.)
- Analyzes individual responses
- Compares CoT vs Non-CoT
- Runs consistency tests (3 iterations each)
- Calculates entropy

**Duration**: ~2-3 minutes

---

### Quick Comparison
```bash
node examples/benchmark-cot.js --quick
```

**What it does**:
- Single scenario (Greeting)
- Quick comparison
- Shows score differences

**Duration**: ~10 seconds

---

### Entropy Test Only
```bash
node examples/benchmark-cot.js --entropy
```

**What it does**:
- Tests response consistency
- 5 iterations per endpoint
- Calculates entropy (variability)

**Duration**: ~1 minute

---

## 📈 Understanding Results

### Sample Output

```
═══════════════════════════════════════════════════════════════════════════════
🆚 COMPARISON RESULTS
═══════════════════════════════════════════════════════════════════════════════

📊 Score Comparison:
┌─────────────────┬──────────────┬──────────────┬────────────┐
│ Metric          │ Original     │ CoT          │ Difference │
├─────────────────┼──────────────┼──────────────┼────────────┤
│ empathy         │         4.20 │         8.40 │ ↑    +4.20 │
│ context         │         2.00 │         6.00 │ ↑    +4.00 │
│ naturalness     │         3.50 │         7.80 │ ↑    +4.30 │
│ diversity       │         6.80 │         7.20 │ ↑    +0.40 │
│ complexity      │         7.50 │         7.80 │ ↑    +0.30 │
│ overall         │         4.58 │         7.68 │ ↑    +3.10 │
└─────────────────┴──────────────┴──────────────┴────────────┘

🏆 Winner: CoT
📈 Improvement: 67.69% (+3.10 points)
```

### Interpreting Scores

| Overall Score | Grade | Quality |
|---------------|-------|---------|
| 9.0 - 10.0 | A+ | Exceptional |
| 8.5 - 8.9 | A | Excellent |
| 8.0 - 8.4 | A- | Very Good |
| 7.5 - 7.9 | B+ | Good |
| 7.0 - 7.4 | B | Above Average |
| 6.5 - 6.9 | B- | Average |
| < 6.5 | C or below | Needs Improvement |

---

## 🎲 Entropy Analysis

### What is Entropy?

**Entropy** mengukur variabilitas respons untuk input yang sama:
- **Low Entropy (0.0 - 0.3)**: Very consistent
- **Medium Entropy (0.3 - 0.5)**: Moderately consistent
- **High Entropy (0.5 - 1.0)**: Highly variable

### Formula

```
Entropy = 1 - Average Similarity
```

Where similarity is calculated using Jaccard similarity on words.

### Interpretation

**Original Endpoint**:
- Expected: Lower entropy (more consistent)
- Reason: Simpler prompts, less reasoning variation

**CoT Endpoint**:
- Expected: Slightly higher entropy (more creative)
- Reason: Multi-step reasoning explores different paths
- **Good**: Shows AI is thinking, not just templating

### Example Output

```
🎲 Entropy Analysis: Original /chat
   Entropy: 0.245
   Avg Similarity: 75.5%
   Interpretation: Very consistent

🎲 Entropy Analysis: CoT /chat/cot
   Entropy: 0.387
   Avg Similarity: 61.3%
   Interpretation: Moderately consistent
```

**Insight**: CoT has higher entropy but still maintains good consistency. This is **positive** - it shows creative reasoning while staying on-topic.

---

## 📊 Expected Results

Based on our implementation, you should see:

### Empathy Score
- **Original**: 3-5 / 10
- **CoT**: 7-9 / 10
- **Improvement**: +100-150%

### Context Awareness
- **Original**: 1-3 / 10
- **CoT**: 5-8 / 10
- **Improvement**: +150-300%

### Naturalness
- **Original**: 3-5 / 10
- **CoT**: 6-9 / 10
- **Improvement**: +80-150%

### Overall Quality
- **Original**: 4-6 / 10 (Grade: C to B-)
- **CoT**: 7-9 / 10 (Grade: B to A)
- **Improvement**: +50-100%

---

## 🔍 Detailed Analysis Features

### 1. Individual Response Analysis

Shows detailed breakdown:
```
📊 Analysis: CoT /chat/cot
═══════════════════════════════════════════════════════════════════════════════

📝 Text Preview:
   Assalamualaikum... Senang banget kamu mau datang ke sini...
   Length: 342 characters

📈 Scores:
   Empathy:      8.40/10
   Context:      6.00/10
   Naturalness:  7.80/10
   Diversity:    7.20/10
   Complexity:   7.80/10
   ─────────────────────────────
   OVERALL:      7.68/10 (B+)

🔍 Detailed Metrics:
   Empathy Keywords: High=4, Med=3, Low=1
   Context Phrases: 2 found
      → di satu sisi, di sisi lain
   Natural Markers: 8
   Formal Phrases: 0 (penalty)
   Lexical Diversity: 72.3%
   Avg Words/Sentence: 12.4
```

### 2. Side-by-Side Comparison

Direct comparison with difference calculation:
```
┌─────────────────┬──────────────┬──────────────┬────────────┐
│ Metric          │ Original     │ CoT          │ Difference │
├─────────────────┼──────────────┼──────────────┼────────────┤
│ empathy         │         4.20 │         8.40 │ ↑    +4.20 │
```

### 3. Consistency Testing

Multiple iterations to measure reliability:
```
🔄 Running consistency test: 3 iterations...
   Iteration 1: ✓
   Iteration 2: ✓
   Iteration 3: ✓

🎲 Entropy: 0.245 (Very consistent)
```

---

## 💡 Use Cases

### 1. Quality Assurance
```bash
# Before deploying to production
node examples/benchmark-cot.js

# Check if overall score > 7.0
# Check if empathy score > 6.0
```

### 2. A/B Testing
```bash
# Compare different prompt versions
# Modify prompts, then run benchmark
node examples/benchmark-cot.js --quick
```

### 3. Regression Testing
```bash
# After code changes
node examples/benchmark-cot.js

# Compare with baseline scores
# Ensure no quality degradation
```

### 4. Consistency Monitoring
```bash
# Check response stability
node examples/benchmark-cot.js --entropy

# Ensure entropy < 0.5 for production
```

---

## 🎯 Optimization Tips

### Improving Empathy Score
1. Add more empathy keywords to prompts
2. Use CoT to analyze emotional context
3. Include validation phrases

### Improving Context Awareness
1. Explicitly reference previous choices
2. Use CoT to connect related problems
3. Build narrative continuity

### Improving Naturalness
1. Avoid formal language in prompts
2. Use conversational markers (ya, kok, sih)
3. Remove robotic phrases

### Balancing Entropy
- **Too Low** (<0.2): May be too templated
- **Optimal** (0.2-0.4): Good balance
- **Too High** (>0.6): May be inconsistent

---

## 🚨 Troubleshooting

### "Connection refused"
```bash
# Make sure server is running
node src/app.js

# In another terminal:
node examples/benchmark-cot.js
```

### "Timeout error"
```bash
# Groq API might be slow
# Increase timeout in benchmark script
# Or run --quick mode
```

### "Unexpected scores"
```bash
# Check if prompts are loaded correctly
# Verify .env has GROQ_API_KEY
# Try --quick mode first
```

---

## 📚 Alternative to Logprobs

### Why Not Logprobs?

Groq doesn't support logprobs yet (as of Dec 2024). But our metrics are **better** for counseling use case:

| Logprobs | Our Metrics |
|----------|-------------|
| Token probability | Empathy keywords |
| Perplexity | Context awareness |
| Entropy (token-level) | Response variability |
| Generic | Domain-specific |

### Advantages

✅ **Domain-Specific**: Tailored for counseling  
✅ **Interpretable**: Clear what each metric means  
✅ **Actionable**: Know exactly what to improve  
✅ **Comprehensive**: Multiple quality dimensions  

---

## 🔮 Future Enhancements

When Groq adds logprobs support:

1. **Combine Metrics**
   - Use logprobs for confidence
   - Use our metrics for quality
   - Best of both worlds

2. **Uncertainty Detection**
   - Low logprobs = uncertain response
   - Trigger fallback or clarification

3. **Token-Level Analysis**
   - Which tokens have low probability?
   - Identify potential hallucinations

---

## 📖 References

- [Jaccard Similarity](https://en.wikipedia.org/wiki/Jaccard_index)
- [Lexical Diversity](https://en.wikipedia.org/wiki/Lexical_diversity)
- [Shannon Entropy](https://en.wikipedia.org/wiki/Entropy_(information_theory))

---

**Created**: 2025-12-14  
**Version**: 1.0.0  
**Status**: Production Ready ✅
