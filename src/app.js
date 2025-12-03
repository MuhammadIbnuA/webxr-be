// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Groq = require("groq-sdk");
const { synthesizeSpeech } = require("./tts"); // TTS via ElevenLabs

// ====== INIT ======
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ====== GROQ CLIENT ======
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-70b-versatile";

// ====== DATA: TOPICS & PROBLEMS ======

const TOPICS = {
  diri: {
    id: "diri",
    label: "Damai dengan Diri",
    description:
      "Ketenangan batin, penerimaan diri, keseimbangan emosi, dan kemampuan mengelola stres.",
    problems: [
      {
        id: "tekanan_kecemasan_akademik",
        title: "Tekanan dan kecemasan akademik",
        detail:
          "Merasa tertekan oleh tugas, nilai, dan persaingan sehingga muncul cemas, tidak percaya diri, dan stres.",
      },
      {
        id: "krisis_identitas_arah_hidup",
        title: "Krisis identitas dan arah hidup",
        detail:
          "Bingung menemukan jati diri, minat, dan tujuan hidup sehingga merasa kosong atau tersesat.",
      },
      {
        id: "kesehatan_mental_belum_tertangani",
        title: "Kesehatan mental yang belum tertangani",
        detail:
          "Belum terlalu peduli kesehatan mental dan masih ada rasa malu atau stigma untuk mencari bantuan.",
      },
      {
        id: "paparan_media_sosial",
        title: "Paparan media sosial",
        detail:
          "Sering membandingkan diri dengan orang lain di media sosial dan merasa tidak cukup atau kurang berharga.",
      },
      {
        id: "kehilangan_spiritualitas",
        title: "Kehilangan spiritualitas",
        detail:
          "Merasa ibadah menurun, jauh dari nilai-nilai spiritual, atau sulit merasakan kedekatan dengan Tuhan.",
      },
    ],
  },
  sosial: {
    id: "sosial",
    label: "Damai dengan Sosial",
    description:
      "Kemampuan hidup rukun, menghargai perbedaan, dan berempati dalam interaksi sosial.",
    problems: [
      {
        id: "intoleransi_stereotip",
        title: "Intoleransi dan stereotip",
        detail:
          "Ada gesekan atau jarak dengan teman yang berbeda suku, agama, atau latar belakang.",
      },
      {
        id: "bullying_perundungan_digital",
        title: "Bullying dan perundungan digital",
        detail:
          "Pernah mengalami atau menyaksikan perundungan, baik secara langsung maupun di media sosial.",
      },
      {
        id: "kurang_empati_komunikasi",
        title: "Kurangnya empati dan komunikasi sehat",
        detail:
          "Sering terjadi konflik kecil, salah paham, atau sulit menyampaikan perasaan dengan cara yang baik.",
      },
      {
        id: "kesenjangan_sosial_ekonomi",
        title: "Kesenjangan sosial dan ekonomi",
        detail:
          "Merasa minder atau justru superior karena perbedaan kondisi ekonomi dengan teman sebaya.",
      },
      {
        id: "budaya_kompetitif_ego",
        title: "Budaya kompetitif dan egosentris",
        detail:
          "Merasa lingkungan terlalu kompetitif sehingga nilai kebersamaan dan gotong royong berkurang.",
      },
    ],
  },
  alam: {
    id: "alam",
    label: "Damai dengan Alam",
    description:
      "Hubungan harmonis dengan lingkungan hidup, kepedulian, dan perilaku ramah lingkungan.",
    problems: [
      {
        id: "rendah_kesadaran_ekologis",
        title: "Menurunnya kesadaran ekologis",
        detail:
          "Kurang peduli isu lingkungan seperti sampah, air, dan energi karena terasa jauh dari kehidupan sehari-hari.",
      },
      {
        id: "konsumtivisme_tidak_ramah_lingkungan",
        title: "Konsumtivisme dan perilaku tidak ramah lingkungan",
        detail:
          "Sering memakai barang sekali pakai, plastik, atau membuang makanan tanpa banyak dipikir.",
      },
      {
        id: "minim_praktik_cinta_lingkungan",
        title: "Minimnya praktik cinta lingkungan di sekolah",
        detail:
          "Program penghijauan, daur ulang, atau konservasi berjalan sesaat saja, belum jadi kebiasaan.",
      },
      {
        id: "urbanisasi_alienasi_alam",
        title: "Urbanisasi dan alienasi dari alam",
        detail:
          "Jarang berinteraksi dengan alam sehingga merasa jauh dan kurang empati pada kerusakan lingkungan.",
      },
    ],
  },
};

// ====== BASE STORIES (RINGKAS DARI TEKS KAMU) ======

const BASE_STORIES = {
  biola_ikhlas: {
    id: "biola_ikhlas",
    title: "Biola Kiai Dahlan Memberi Jawaban (Ikhlas)",
    text: `
Biola Kiai Dahlan digunakan untuk menjawab pertanyaan muridnya tentang hakikat beragama. Dengan menggesek biola dan memainkan tembang Asmaradhana yang lembut, para santri merasakan keindahan, ketenangan, dan seolah beban mereka menghilang. Dari situ, Kiai Dahlan menjelaskan bahwa orang yang beragama dengan benar adalah orang yang merasakan kedamaian, mengayomi, dan menyelimuti sekitarnya.

Ketika para santri mencoba menggesek biola sendiri, suara yang keluar menjadi menderit dan tidak nyaman didengar. Kiai Dahlan menganalogikan orang yang beragama tanpa ilmu dan keikhlasan sebagai orang yang memainkan biola tanpa belajar: alih-alih membawa ketenangan, justru menimbulkan ketidaknyamanan bagi diri dan lingkungan. Kisah ini menekankan pentingnya keikhlasan dan kesungguhan dalam belajar agama dan merawat kedamaian batin.
    `.trim(),
  },
  budi_utomo: {
    id: "budi_utomo",
    title: "Belajar dari Budi Utomo (Rendah Hati)",
    text: `
Matahari sore di Kauman menjadi latar ketika Kiai Dahlan mendatangi langgar kidul. Di sana, Sudja bercerita bahwa beberapa santri dilarang keluarganya mengaji karena tidak setuju Kiai Dahlan bergabung dengan Budi Utomo dan memakai jas serta sepatu seperti orang Belanda. Mereka menilai organisasi itu terlalu dekat dengan budaya menari, bernyanyi, dan minum alkohol.

Kiai Dahlan menjelaskan bahwa ia bergabung untuk belajar cara membangun organisasi yang bisa bermanfaat bagi umat. Ia menegaskan pentingnya hati yang terbuka, sesuai makna wahyu pertama “Iqra” – bacalah, telitilah, pelajarilah. Kerendahan hati untuk belajar dari berbagai sumber menjadi kunci untuk memperbaiki kehidupan umat, tanpa kehilangan prinsip dan nilai Islam.
    `.trim(),
  },
  madrasah_welas_asih: {
    id: "madrasah_welas_asih",
    title: "Mendirikan Madrasah Ibtidaiyah Diniyah (Welas Asih)",
    text: `
Di rumahnya, Kiai Dahlan menata tiga pasang meja dan kursi serta memasang papan tulis dari kayu suren. Ia berniat mendirikan Madrasah Ibtidaiyah Diniyah. Murid-murid mempertanyakan langkah ini karena madrasah dianggap seharusnya seperti pesantren tradisional tanpa meja kursi, dan penggunaan meja kursi dikaitkan dengan sekolah Belanda.

Alih-alih berdebat panjang, Kiai Dahlan mengajak murid-murid mencari anak-anak yang belum bersekolah untuk diajak belajar. Tindakan ini menunjukkan welas asih dan keberanian berinovasi demi mencerdaskan mereka yang tertinggal. Madrasah dengan meja dan kursi bukan sekadar meniru, melainkan sarana baru untuk menebar kasih sayang dan ilmu.
    `.trim(),
  },
};

function pickBaseStoryForTopic(topicId) {
  switch (topicId) {
    case "diri":
      return BASE_STORIES.biola_ikhlas;
    case "sosial":
      return BASE_STORIES.budi_utomo;
    case "alam":
      return BASE_STORIES.madrasah_welas_asih;
    default:
      return BASE_STORIES.biola_ikhlas;
  }
}

// ====== SESSION STORE (IN-MEMORY) ======

/**
 * session: {
 *   id: string
 *   state: 'greeting' | 'identify_topic' | 'collecting_problem' | 'story'
 *   topicId: 'diri' | 'sosial' | 'alam' | null
 *   selectedProblems: string[]
 * }
 */
const sessions = new Map();

function createSessionId() {
  return crypto.randomUUID();
}

function getOrCreateSession(sessionIdFromClient) {
  if (sessionIdFromClient && sessions.has(sessionIdFromClient)) {
    return sessions.get(sessionIdFromClient);
  }
  const id = sessionIdFromClient || createSessionId();
  const session = {
    id,
    state: "greeting",
    topicId: null,
    selectedProblems: [],
  };
  sessions.set(id, session);
  return session;
}

// ====== SMALL HELPERS ======

async function withSpeech(session, messageObj) {
  const speechSource =
    messageObj.speechText || messageObj.message || messageObj.storyText;

  const audio = await synthesizeSpeech(speechSource || "");

  return {
    ...messageObj,
    sessionId: session.id,
    audio: audio
      ? {
          enabled: true,
          mimeType: audio.mimeType,
          base64: audio.base64,
        }
      : {
        enabled: false,
        mimeType: null,
        base64: null,
      },
  };
}

function topicToOptions() {
  return Object.values(TOPICS).map((t) => ({
    id: t.id,
    label: t.label,
    description: t.description,
  }));
}

function buildProblemOptions(topicId, alreadySelected) {
  const topic = TOPICS[topicId];
  if (!topic) return [];

  return topic.problems
    .filter((p) => !alreadySelected.includes(p.id))
    .map((p) => ({
      id: p.id,
      label: p.title,
      description: p.detail,
    }));
}

async function buildPersonalizedStory({ topicId, selectedProblems }) {
  const base = pickBaseStoryForTopic(topicId);

  const problemsText = selectedProblems
    .map((p) => {
      const topic = TOPICS[topicId];
      if (!topic) return null;
      const problem = topic.problems.find((pr) => pr.id === p);
      if (!problem) return null;
      return `- ${problem.title}: ${problem.detail}`;
    })
    .filter(Boolean)
    .join("\n");

  const prompt = `
Kamu adalah konselor sekolah yang menggunakan teknik relaksasi berbasis cerita Kiai Ahmad Dahlan.

Berikut cerita dasar:
"""${base.text}"""

Berikut adalah 3 masalah yang sedang dialami siswa:
${problemsText}

TUGAS:
- Gabungkan cerita dasar dengan kondisi siswa.
- Bahasa Indonesia, hangat, lembut, seperti konselor.
- Struktur:
  1. Pembukaan relaksasi singkat.
  2. Masuk ke cerita Kiai Dahlan.
  3. Kaitkan secara eksplisit dengan 3 masalah siswa.
  4. Akhiri dengan afirmasi positif dan ajakan refleksi.

Huruf rapi, paragraf tidak terlalu panjang.
`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content:
          "Kamu adalah konselor sekolah yang empatik, berbahasa Indonesia yang halus, dan selalu menjaga sensitivitas siswa.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  const storyText =
    completion.choices?.[0]?.message?.content?.trim() ||
    base.text ||
    "Maaf, cerita belum bisa dibuat saat ini.";

  return {
    baseStory: base,
    storyText,
  };
}

/**
 * Bangun kalimat tanya + pembacaan opsi secara dinamis untuk state yang punya options.
 * mode: "topic" | "problem"
 */
async function buildSpokenOptionsPrompt({ mode, topic, round, options, previousCount }) {
  const simpleOptions = options.map((o) => ({
    id: o.id,
    label: o.label,
    description: o.description,
  }));

  let context = "";
  if (mode === "topic") {
    context = `
Ini adalah tahap pemilihan area kedamaian awal.
Siswa akan memilih salah satu area berikut sebagai fokus utama sesi:
- Damai dengan Diri
- Damai dengan Sosial
- Damai dengan Alam
`;
  } else if (mode === "problem") {
    context = `
Ini adalah tahap penggalian masalah untuk topik "${topic?.label}".
Saat ini sudah ada ${previousCount || 0} masalah yang dipilih.
Sekarang konselor ingin menanyakan lagi, dari beberapa pilihan berikut, mana yang juga terasa dekat dengan kondisinya.
Round: ${round}.
`;
  }

  const prompt = `
Kamu adalah konselor sekolah yang empatik dan berbahasa Indonesia halus.

Konteks:
${context}

Berikut daftar opsi dalam bentuk JSON:
${JSON.stringify(simpleOptions, null, 2)}

TUGAS:
- Buat satu teks yang akan DIBACAKAN dengan suara.
- Gaya: lembut, Islami, nada tanya, seolah konselor sedang mengajak siswa merenung.
- Sertakan pembukaan singkat yang hangat.
- BACAKAN setiap opsi secara alami, misalnya:
  "Kalau kamu lebih banyak merasa ..., itu biasanya masuk ke pilihan ...."
  "Kalau yang terasa mengganggu adalah ..., maka itu termasuk ...."
- Akhiri dengan pertanyaan yang jelas, misalnya:
  "Menurutmu, dari semua pilihan tadi, mana yang paling terasa dekat denganmu sekarang?"
- Jangan sebut kata 'JSON', 'opsi', 'id', atau istilah teknis.
- Jangan menyuruh klik tombol, cukup pakai bahasa umum seperti "pilihan", "yang pertama", "yang kedua", dll.
- Jangan menyebut diri sebagai AI atau sistem.

Kembalikan HANYA teks yang akan dibacakan, tanpa penjelasan tambahan.
`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content:
          "Kamu adalah konselor sekolah yang empatik, Islami, dan berbahasa Indonesia yang halus.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  const text =
    completion.choices?.[0]?.message?.content?.trim() ||
    "Dari beberapa pilihan yang tersedia, silakan pilih mana yang paling terasa dekat denganmu saat ini.";

  return text;
}

// ====== STATE HANDLERS ======

async function handleGreeting(session) {
  session.state = "identify_topic";
  session.topicId = null;
  session.selectedProblems = [];

  // Greeting FULLY dinamis dari Groq, sekaligus menyebut 3 topik
  const prompt = `
Buat satu pesan pembuka konseling untuk siswa SMA dalam bahasa Indonesia yang lembut, Islami, dan menenangkan.

Syarat:
- Mulai dengan salam "Assalamualaikum".
- Jelaskan bahwa ini adalah ruang aman untuk bercerita dan relaksasi.
- Sebutkan secara eksplisit tiga area yang bisa dipilih:
  1) "Damai dengan Diri"
  2) "Damai dengan Sosial"
  3) "Damai dengan Alam"
- Ajak siswa untuk memilih salah satu area yang paling ingin ia fokuskan terlebih dahulu.
- Gaya bahasa seperti konselor sekolah yang hangat dan tidak menggurui.
- Jangan sebut diri sebagai AI atau sistem.
- Teks 1–3 paragraf pendek, mudah dibacakan dengan suara pelan.
`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content:
          "Kamu adalah konselor sekolah yang empatik, Islami, dan berbahasa Indonesia yang halus.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  const greetingMessage =
    completion.choices?.[0]?.message?.content?.trim() ||
    "Assalamualaikum, terima kasih sudah datang. Di sini kamu boleh bercerita dengan tenang. Silakan pilih area yang ingin kamu fokuskan: Damai dengan Diri, Damai dengan Sosial, atau Damai dengan Alam.";

  const message = {
    currentState: "identify_topic",
    type: "topic_selection",
    message: greetingMessage,
    speechText: greetingMessage,
    options: topicToOptions(),
  };

  return withSpeech(session, message);
}

async function handleIdentifyTopic(session, payload) {
  const { topicId } = payload || {};

  // Kalau belum ada / salah → tanya ulang pakai gaya dinamis + opsi dibacakan
  if (!topicId || !TOPICS[topicId]) {
    const options = topicToOptions();
    const spoken = await buildSpokenOptionsPrompt({
      mode: "topic",
      options,
      round: null,
      topic: null,
      previousCount: 0,
    });

    const msg = {
      currentState: "identify_topic",
      type: "topic_selection",
      message: spoken,
      speechText: spoken,
      options,
    };
    return withSpeech(session, msg);
  }

  // kalau valid → set topic dan lanjut ke collecting_problem (round 1)
  session.topicId = topicId;
  session.selectedProblems = [];
  session.state = "collecting_problem";

  const options = buildProblemOptions(topicId, []);
  const round = 1;
  const topic = TOPICS[topicId];

  const spoken = await buildSpokenOptionsPrompt({
    mode: "problem",
    topic,
    round,
    options,
    previousCount: 0,
  });

  const message = {
    currentState: "collecting_problem",
    type: "problem_selection",
    round,
    message: spoken,
    speechText: spoken,
    options,
  };

  return withSpeech(session, message);
}

async function handleCollectingProblem(session, payload) {
  const { problemId } = payload || {};
  const { topicId, selectedProblems } = session;

  if (!topicId || !TOPICS[topicId]) {
    session.state = "identify_topic";
    return handleIdentifyTopic(session, {});
  }

  const topic = TOPICS[topicId];
  const validProblem = topic.problems.find((p) => p.id === problemId);

  // Kalau problemId tidak valid → bacakan ulang opsi yang tersedia dengan nada tanya
  if (!validProblem) {
    const options = buildProblemOptions(topicId, selectedProblems);
    const spoken = await buildSpokenOptionsPrompt({
      mode: "problem",
      topic,
      round: (selectedProblems.length || 0) + 1,
      options,
      previousCount: selectedProblems.length || 0,
    });

    const message = {
      currentState: "collecting_problem",
      type: "problem_selection",
      round: (selectedProblems.length || 0) + 1,
      message: spoken,
      speechText: spoken,
      options,
    };
    return withSpeech(session, message);
  }

  if (!selectedProblems.includes(problemId)) {
    selectedProblems.push(problemId);
  }

  // Kalau belum 3 problem → lanjut round berikutnya, dengan prompt dinamis
  if (selectedProblems.length < 3) {
    const round = selectedProblems.length + 1;
    const options = buildProblemOptions(topicId, selectedProblems);

    const spoken = await buildSpokenOptionsPrompt({
      mode: "problem",
      topic,
      round,
      options,
      previousCount: selectedProblems.length,
    });

    const message = {
      currentState: "collecting_problem",
      type: "problem_selection",
      round,
      message: spoken,
      speechText: spoken,
      options,
    };

    return withSpeech(session, message);
  }

  // Sudah 3 problem → generate story
  session.state = "story";

  const { baseStory, storyText } = await buildPersonalizedStory({
    topicId,
    selectedProblems,
  });

  const selectedProblemsFull = selectedProblems
    .map((id) => topic.problems.find((p) => p.id === id))
    .filter(Boolean);

  const message = {
    currentState: "story",
    type: "story",
    storyText,
    speechText: storyText,
    baseStoryMeta: {
      id: baseStory.id,
      title: baseStory.title,
    },
    selectedProblems: selectedProblemsFull,
  };

  return withSpeech(session, message);
}

// OPTIONAL: restart session dengan topik yang sama
async function handleRestartSession(session, payload) {
  const keepTopic = payload?.keepTopic ?? true;

  if (!keepTopic) {
    // mulai benar-benar baru
    session.state = "greeting";
    session.topicId = null;
    session.selectedProblems = [];
    return handleGreeting(session);
  }

  // restart dari awal collecting_problem dengan topic lama
  if (!session.topicId || !TOPICS[session.topicId]) {
    session.state = "identify_topic";
    return handleIdentifyTopic(session, {});
  }

  session.selectedProblems = [];
  session.state = "collecting_problem";

  const options = buildProblemOptions(session.topicId, []);
  const topic = TOPICS[session.topicId];

  const spoken = await buildSpokenOptionsPrompt({
    mode: "problem",
    topic,
    round: 1,
    options,
    previousCount: 0,
  });

  const message = {
    currentState: "collecting_problem",
    type: "problem_selection",
    round: 1,
    message: spoken,
    speechText: spoken,
    options,
  };

  return withSpeech(session, message);
}

// ====== ROUTES ======

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.post("/chat", async (req, res) => {
  try {
    const { sessionId, state, payload } = req.body || {};

    const session = getOrCreateSession(sessionId);

    const effectiveState = state || session.state || "greeting";

    let response;

    switch (effectiveState) {
      case "greeting":
        response = await handleGreeting(session);
        break;
      case "identify_topic":
        response = await handleIdentifyTopic(session, payload);
        break;
      case "collecting_problem":
        response = await handleCollectingProblem(session, payload);
        break;
      case "story":
        // replay simple info
        response = {
          sessionId: session.id,
          currentState: "story",
          message:
            "Sesi cerita sudah selesai. Jika kamu ingin memulai sesi baru, kamu bisa memulai lagi dari awal.",
          speechText:
            "Sesi cerita kita sudah selesai. Kalau kamu ingin memulai sesi baru, kamu bisa mulai lagi dari awal kapan saja.",
        };
        response = await withSpeech(session, response);
        break;
      case "restart_session":
        response = await handleRestartSession(session, payload);
        break;
      default:
        session.state = "greeting";
        response = await handleGreeting(session);
    }

    res.json(response);
  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// ====== START SERVER ======
app.listen(PORT, () => {
  console.log(`Konseling AI backend listening on port ${PORT}`);
});
