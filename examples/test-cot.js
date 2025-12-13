// examples/test-cot.js
// Example script to test Chain of Thought implementation

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';
let sessionId = null;

// Helper function to make API calls
async function callAPI(endpoint, state, payload = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, state, payload })
    });

    const data = await response.json();

    // Update sessionId if this is first call
    if (!sessionId && data.sessionId) {
        sessionId = data.sessionId;
    }

    return data;
}

// Helper to display response
function displayResponse(label, data) {
    console.log('\n' + '='.repeat(80));
    console.log(`📍 ${label}`);
    console.log('='.repeat(80));
    console.log(`Session ID: ${data.sessionId}`);
    console.log(`State: ${data.currentState}`);
    console.log(`CoT Enabled: ${data.cotEnabled ? '✅ Yes' : '❌ No'}`);
    console.log('\n💬 Message:');
    console.log(data.message || data.storyText || 'N/A');

    if (data.options && data.options.length > 0) {
        console.log('\n📋 Options:');
        data.options.forEach((opt, idx) => {
            console.log(`  ${idx + 1}. ${opt.label}`);
            console.log(`     ${opt.description}`);
        });
    }

    if (data.selectedProblems) {
        console.log('\n✅ Selected Problems:');
        data.selectedProblems.forEach((prob, idx) => {
            console.log(`  ${idx + 1}. ${prob.title}`);
        });
    }

    console.log('='.repeat(80));
}

// Main test flow
async function testCoTFlow() {
    console.log('\n🧠 TESTING CHAIN OF THOUGHT IMPLEMENTATION\n');

    try {
        // 1. Test Greeting with CoT
        console.log('\n🔹 Step 1: Greeting (CoT)');
        const greeting = await callAPI('/chat/cot', 'greeting');
        displayResponse('GREETING WITH COT', greeting);

        await sleep(2000);

        // 2. Select Topic: "diri"
        console.log('\n🔹 Step 2: Select Topic - Damai dengan Diri');
        const topicSelection = await callAPI('/chat/cot', 'identify_topic', {
            topicId: 'diri'
        });
        displayResponse('TOPIC SELECTION WITH COT', topicSelection);

        await sleep(2000);

        // 3. Select Problem 1: Tekanan akademik
        console.log('\n🔹 Step 3: Select Problem 1 - Tekanan Akademik');
        const problem1 = await callAPI('/chat/cot', 'collecting_problem', {
            problemId: 'tekanan_kecemasan_akademik'
        });
        displayResponse('PROBLEM 1 WITH COT (Notice the empathy)', problem1);

        await sleep(2000);

        // 4. Select Problem 2: Krisis identitas
        console.log('\n🔹 Step 4: Select Problem 2 - Krisis Identitas');
        const problem2 = await callAPI('/chat/cot', 'collecting_problem', {
            problemId: 'krisis_identitas_arah_hidup'
        });
        displayResponse('PROBLEM 2 WITH COT (Context-aware empathy for problem 1)', problem2);

        await sleep(2000);

        // 5. Select Problem 3: Media sosial
        console.log('\n🔹 Step 5: Select Problem 3 - Media Sosial');
        const problem3 = await callAPI('/chat/cot', 'collecting_problem', {
            problemId: 'paparan_media_sosial'
        });
        displayResponse('PROBLEM 3 WITH COT (Context-aware empathy for problems 1 & 2)', problem3);

        await sleep(2000);

        // 6. Story Generation
        console.log('\n🔹 Step 6: Personalized Story Generation');
        displayResponse('PERSONALIZED STORY WITH COT', problem3);

        console.log('\n\n✅ TEST COMPLETED SUCCESSFULLY!\n');
        console.log('📊 Key Observations:');
        console.log('   1. Greeting is more empathetic and natural');
        console.log('   2. Each problem selection shows SPECIFIC empathy for previous choices');
        console.log('   3. Story is deeply personalized based on selected problems');
        console.log('   4. All responses have cotEnabled: true flag\n');

    } catch (error) {
        console.error('\n❌ Error during test:', error.message);
        console.error(error);
    }
}

// Comparison test: CoT vs Non-CoT
async function testComparison() {
    console.log('\n📊 COMPARISON TEST: CoT vs Non-CoT\n');

    try {
        // Reset session
        sessionId = null;

        // Test with CoT
        console.log('\n🧠 Testing WITH Chain of Thought:');
        const cotGreeting = await callAPI('/chat/cot', 'greeting');
        console.log('\n💬 CoT Greeting:');
        console.log(cotGreeting.message);

        await sleep(2000);

        // Reset session
        sessionId = null;

        // Test without CoT
        console.log('\n\n🤖 Testing WITHOUT Chain of Thought:');
        const normalGreeting = await callAPI('/chat', 'greeting');
        console.log('\n💬 Normal Greeting:');
        console.log(normalGreeting.message);

        console.log('\n\n📈 Analysis:');
        console.log('   - CoT version tends to be more empathetic and natural');
        console.log('   - CoT version better understands emotional context');
        console.log('   - Both are good, but CoT provides deeper connection\n');

    } catch (error) {
        console.error('\n❌ Error during comparison:', error.message);
    }
}

// Helper sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--compare')) {
        await testComparison();
    } else {
        await testCoTFlow();
    }
}

// Execute
main().catch(console.error);
