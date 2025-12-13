// src/utils/response-analyzer.js
// Analyzer untuk membandingkan kualitas respons CoT vs Non-CoT

/**
 * Analyze response quality metrics
 * Since Groq doesn't support logprobs yet, we use alternative metrics
 */

// Empathy keywords in Indonesian
const EMPATHY_KEYWORDS = {
    high: [
        'aku bisa bayangin', 'aku ngerti', 'pasti nggak mudah', 'pasti berat',
        'aku paham', 'aku tau', 'rasanya', 'perasaan', 'gimana rasanya',
        'terasa', 'dipahami', 'didengarkan', 'aman', 'nyaman'
    ],
    medium: [
        'mungkin', 'kadang', 'seperti', 'bisa jadi', 'terasa',
        'merasa', 'perasaan', 'kondisi', 'situasi'
    ],
    low: [
        'baik', 'oke', 'terima kasih', 'silakan', 'pilih'
    ]
};

// Context-aware phrases (menunjukkan AI mengingat konteks sebelumnya)
const CONTEXT_PHRASES = [
    'yang kamu pilih tadi', 'seperti yang kamu bilang', 'tadi kamu',
    'sebelumnya', 'dua hal', 'tiga hal', 'selain', 'di satu sisi',
    'di sisi lain', 'dan juga', 'ditambah dengan'
];

// Natural conversation markers
const NATURAL_MARKERS = [
    'ya', 'kok', 'sih', 'kan', 'dong', 'deh', 'nih',
    'gimana', 'kayak', 'banget', 'nggak', 'gak'
];

// Formal/robotic phrases (should be avoided)
const FORMAL_PHRASES = [
    'sistem', 'aplikasi', 'platform', 'AI', 'robot',
    'terima kasih sudah', 'baik, sekarang', 'silakan pilih'
];

/**
 * Calculate empathy score
 */
function calculateEmpathyScore(text) {
    const lowerText = text.toLowerCase();
    let score = 0;
    let details = { high: 0, medium: 0, low: 0 };

    // High empathy keywords (3 points each)
    EMPATHY_KEYWORDS.high.forEach(keyword => {
        const count = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
        details.high += count;
        score += count * 3;
    });

    // Medium empathy keywords (2 points each)
    EMPATHY_KEYWORDS.medium.forEach(keyword => {
        const count = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
        details.medium += count;
        score += count * 2;
    });

    // Low empathy keywords (1 point each)
    EMPATHY_KEYWORDS.low.forEach(keyword => {
        const count = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
        details.low += count;
        score += count * 1;
    });

    return { score, details, normalized: Math.min(score / 10, 10) };
}

/**
 * Calculate context awareness score
 */
function calculateContextScore(text) {
    const lowerText = text.toLowerCase();
    let count = 0;
    const found = [];

    CONTEXT_PHRASES.forEach(phrase => {
        if (lowerText.includes(phrase)) {
            count++;
            found.push(phrase);
        }
    });

    return {
        score: count,
        normalized: Math.min(count * 2, 10),
        found
    };
}

/**
 * Calculate naturalness score
 */
function calculateNaturalnessScore(text) {
    const lowerText = text.toLowerCase();
    let naturalCount = 0;
    let formalCount = 0;
    const foundNatural = [];
    const foundFormal = [];

    // Count natural markers
    NATURAL_MARKERS.forEach(marker => {
        const count = (lowerText.match(new RegExp(`\\b${marker}\\b`, 'g')) || []).length;
        if (count > 0) {
            naturalCount += count;
            foundNatural.push(marker);
        }
    });

    // Count formal phrases (penalty)
    FORMAL_PHRASES.forEach(phrase => {
        if (lowerText.includes(phrase)) {
            formalCount++;
            foundFormal.push(phrase);
        }
    });

    const score = Math.max(0, naturalCount - (formalCount * 2));

    return {
        naturalCount,
        formalCount,
        score,
        normalized: Math.min(score, 10),
        foundNatural,
        foundFormal
    };
}

/**
 * Calculate lexical diversity (vocabulary richness)
 */
function calculateLexicalDiversity(text) {
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2); // Filter short words

    const uniqueWords = new Set(words);
    const diversity = words.length > 0 ? uniqueWords.size / words.length : 0;

    return {
        totalWords: words.length,
        uniqueWords: uniqueWords.size,
        diversity,
        normalized: diversity * 10
    };
}

/**
 * Calculate sentence complexity
 */
function calculateComplexity(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);

    const avgWordsPerSentence = sentences.length > 0
        ? words.length / sentences.length
        : 0;

    const avgWordLength = words.length > 0
        ? words.reduce((sum, w) => sum + w.length, 0) / words.length
        : 0;

    // Optimal: 10-15 words per sentence, 4-6 chars per word
    const sentenceLengthScore = Math.max(0, 10 - Math.abs(avgWordsPerSentence - 12.5));
    const wordLengthScore = Math.max(0, 10 - Math.abs(avgWordLength - 5) * 2);

    return {
        sentences: sentences.length,
        words: words.length,
        avgWordsPerSentence,
        avgWordLength,
        sentenceLengthScore,
        wordLengthScore,
        normalized: (sentenceLengthScore + wordLengthScore) / 2
    };
}

/**
 * Comprehensive response analysis
 */
function analyzeResponse(text, metadata = {}) {
    const empathy = calculateEmpathyScore(text);
    const context = calculateContextScore(text);
    const naturalness = calculateNaturalnessScore(text);
    const diversity = calculateLexicalDiversity(text);
    const complexity = calculateComplexity(text);

    // Overall quality score (weighted average)
    const weights = {
        empathy: 0.30,      // 30% - Most important for counseling
        context: 0.25,      // 25% - Context awareness is crucial
        naturalness: 0.20,  // 20% - Natural conversation
        diversity: 0.15,    // 15% - Vocabulary richness
        complexity: 0.10    // 10% - Sentence structure
    };

    const overallScore =
        empathy.normalized * weights.empathy +
        context.normalized * weights.context +
        naturalness.normalized * weights.naturalness +
        diversity.normalized * weights.diversity +
        complexity.normalized * weights.complexity;

    return {
        metadata,
        text: {
            length: text.length,
            preview: text.substring(0, 100) + '...'
        },
        metrics: {
            empathy,
            context,
            naturalness,
            diversity,
            complexity
        },
        scores: {
            empathy: empathy.normalized,
            context: context.normalized,
            naturalness: naturalness.normalized,
            diversity: diversity.normalized,
            complexity: complexity.normalized,
            overall: overallScore
        },
        grade: getGrade(overallScore),
        timestamp: new Date().toISOString()
    };
}

/**
 * Get letter grade from score
 */
function getGrade(score) {
    if (score >= 9) return 'A+';
    if (score >= 8.5) return 'A';
    if (score >= 8) return 'A-';
    if (score >= 7.5) return 'B+';
    if (score >= 7) return 'B';
    if (score >= 6.5) return 'B-';
    if (score >= 6) return 'C+';
    if (score >= 5.5) return 'C';
    if (score >= 5) return 'C-';
    return 'D';
}

/**
 * Compare two responses
 */
function compareResponses(response1, response2, labels = ['Response 1', 'Response 2']) {
    const analysis1 = analyzeResponse(response1, { label: labels[0] });
    const analysis2 = analyzeResponse(response2, { label: labels[1] });

    const comparison = {
        responses: [analysis1, analysis2],
        differences: {
            empathy: analysis2.scores.empathy - analysis1.scores.empathy,
            context: analysis2.scores.context - analysis1.scores.context,
            naturalness: analysis2.scores.naturalness - analysis1.scores.naturalness,
            diversity: analysis2.scores.diversity - analysis1.scores.diversity,
            complexity: analysis2.scores.complexity - analysis1.scores.complexity,
            overall: analysis2.scores.overall - analysis1.scores.overall
        },
        winner: analysis2.scores.overall > analysis1.scores.overall ? labels[1] : labels[0],
        improvement: {
            percentage: ((analysis2.scores.overall - analysis1.scores.overall) / analysis1.scores.overall * 100).toFixed(2),
            absolute: (analysis2.scores.overall - analysis1.scores.overall).toFixed(2)
        }
    };

    return comparison;
}

/**
 * Calculate entropy-like measure (response variability)
 * Run same prompt multiple times and measure consistency
 */
function calculateResponseEntropy(responses) {
    if (responses.length < 2) {
        return { entropy: 0, message: 'Need at least 2 responses' };
    }

    // Calculate pairwise similarity
    const similarities = [];
    for (let i = 0; i < responses.length; i++) {
        for (let j = i + 1; j < responses.length; j++) {
            const sim = calculateSimilarity(responses[i], responses[j]);
            similarities.push(sim);
        }
    }

    const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
    const entropy = 1 - avgSimilarity; // Higher entropy = more variation

    return {
        entropy,
        avgSimilarity,
        similarities,
        interpretation: entropy < 0.3 ? 'Very consistent' :
            entropy < 0.5 ? 'Moderately consistent' :
                entropy < 0.7 ? 'Variable' : 'Highly variable'
    };
}

/**
 * Simple similarity calculation (Jaccard similarity on words)
 */
function calculateSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
}

module.exports = {
    analyzeResponse,
    compareResponses,
    calculateResponseEntropy,
    calculateEmpathyScore,
    calculateContextScore,
    calculateNaturalnessScore,
    calculateLexicalDiversity,
    calculateComplexity
};
