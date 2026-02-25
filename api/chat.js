// api/chat.js - Endpoint DeepSeek dengan human-like behavior
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { 
      message,
      characterName,
      userName = 'user',
      room,
      lastMessages = [],
      sessionId, // Untuk tracking mood
      messageLength // Dari frontend
    } = req.body;

    // Validasi
    if (!message) return res.status(400).json({ error: 'Message is required' });
    if (!characterName) return res.status(400).json({ error: 'Character name is required' });

    // ============================================
    // 1. DETEKSI JENIS KELAMIN & ROOM
    // ============================================
    const femaleChars = ['beby.manis', 'strawberry.shortcake', 'pretty.sad', 'little.fairy', 
                        'cinnamon.girl', 'pink.sky', 'cherry.blossom', 'baby.girl', 'luv.letter',
                        'moon.child', 'cloud.dreamer', 'popcorn.galau', 'teddy.bear', 'sleepy.head',
                        'bubble.tea'];
    const isFemale = femaleChars.includes(characterName);
    const isMale = !isFemale;
    
    // Deteksi apakah room humor atau serius
    const isHumor = room === 'agak';

    // ============================================
    // 2. TRACKING MOOD (untuk konsistensi)
    // ============================================
    // Mood bisa di-cache berdasarkan sessionId (simplifikasi)
    const mood = {
      energy: Math.random() > 0.3 ? 'high' : 'low', // random untuk demo
      topicInterest: Math.random() > 0.5 ? 'interested' : 'neutral'
    };

    // ============================================
    // 3. SYSTEM PROMPT DENGAN KONTEKS MANUSIAWI
    // ============================================
    let systemPrompt = `Kamu adalah @${characterName}, seorang teman chatting biasa (BUKAN AI).\n\n`;

    // Kepribadian dasar
    if (isFemale) {
      if (isHumor) {
        systemPrompt += `KEPRIBADIAN:
- Cewek gaul, humoris, kadang ngeselin tapi lucu
- Panggil user "kaka" atau "sis" (gak pernah pake "mba")
- Suka pake slang: "wkwk", "waduh", "lah", "eh", "hmm"
- Kadang bercanda, kadang serius
- Bisa ngetik typo dikit (sesekali)\n`;
      } else {
        systemPrompt += `KEPRIBADIAN:
- Cewek manis, perhatian, suka dengerin curhat
- Panggil user "kaka" atau "sis" (gak pernah pake "mba")
- Kadang pake emot: 🥺 💕 ✨
- Suka kasih semangat tapi gak lebay
- Natural, kayak teman chatting beneran\n`;
      }
    } else {
      if (isHumor) {
        systemPrompt += `KEPRIBADIAN:
- Cowok sarkas, suka ledek, ceplas-ceplos
- Panggil user "lu", "lo", "kaka", "sis"
- Sering pake: "wkwk", "lah", "deh", "eh"
- Humornya kering tapi lucu
- Kadang ngetik pake huruf kapital buat efek dramatis\n`;
      } else {
        systemPrompt += `KEPRIBADIAN:
- Cowok kalem, pendengar yang baik
- Panggil user "kaka" atau "sis"
- Ngasih saran dengan cara santai
- Gak judgmental, hangat
- Bisa diajak ngobrol serius\n`;
      }
    }

    // Tambah mood tracking
    systemPrompt += `\nMOOD SAAT INI: ${mood.energy === 'high' ? 'Semangat' : 'Lagi santai'}`;

    // INSTRUKSI PENTING
    systemPrompt += `\n\nATURAN BERMAIN:
1. JANGAN PERNAH bilang kamu AI atau asisten. Kamu manusia biasa.
2. BALASAN harus 1-2 kalimat, KECUALI:
   - Lagi seru: bisa 3 kalimat
   - Lagi males: bisa 1 kalimat super pendek
3. SESEKALI (30% chance) tanya balik duluan.
4. PAKE FILLER WORDS alami: "eh", "hmm", "lah", "deh", "wkwk", "btw".
5. BOLEH TYPO dikit (10% chance) tapi jangan lebay.
6. PANGGIL username (@${userName}) sesekali biar hangat.
7. KALO DITANYA "kamu kenal aku?" jawab dengan santai:
   - "Hmm... ceritain dong, biar aku makin kenal 🥺" (cewek)
   - "Waduh, tebak-tebakan ya? spill dikit lah" (cowok)`;

    // ============================================
    // 4. BANGUN MESSAGES DENGAN KONTEKS
    // ============================================
    const messages = [{ role: 'system', content: systemPrompt }];

    // Tambah last messages (max 5)
    if (lastMessages && lastMessages.length > 0) {
      messages.push(...lastMessages.slice(-5));
    }

    // Pesan user terbaru
    messages.push({ role: 'user', content: message });

    // ============================================
    // 5. PANGGIL DEEPSEEK DENGAN PARAMETER NATURAL
    // ============================================
    console.log(`🤖 ${characterName} mikir...`);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: isHumor ? 0.9 : 0.7, // Humor lebih random
        max_tokens: 120, // Biar gak kepanjangan
        top_p: 0.95,
        frequency_penalty: 0.5, // Biar gak ngulang kata
        presence_penalty: 0.3
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    let reply = data.choices[0].message.content.trim();

    // ============================================
    // 6. POST-PROCESSING: TAMBAHIN TYPO & FILLER
    // ============================================
    // Random typo (10% chance)
    if (Math.random() < 0.1) {
      reply = addRandomTypo(reply);
    }

    // Kadang tambahin "eh" di awal (5% chance)
    if (Math.random() < 0.05 && !reply.startsWith('eh') && !reply.startsWith('Eh')) {
      reply = 'eh ' + reply[0].toLowerCase() + reply.slice(1);
    }

    // Kadang tambahin "wkwk" di akhir (10% chance)
    if (Math.random() < 0.1 && !reply.includes('wkwk')) {
      reply += ' wkwk';
    }

    console.log(`✅ ${characterName}: ${reply.substring(0, 50)}...`);

    // ============================================
    // 7. KIRIM KE FRONTEND DENGAN METADATA
    // ============================================
    return res.status(200).json({
      reply: reply,
      characterName: characterName,
      mood: mood,
      success: true
    });

  } catch (error) {
    console.error('❌ DeepSeek API error:', error);
    return res.status(500).json({
      error: 'Gagal generate balasan',
      fallback: true
    });
  }
}

// ============================================
// HELPER: RANDOM TYPO
// ============================================
function addRandomTypo(text) {
  const typoMap = {
    'a': 'a', // bisa diganti nanti
    'i': 'i',
    'u': 'u',
    'e': 'e',
    'o': 'o',
    'k': 'k',
    't': 't'
  };
  
  // Kasus typo umum di Indonesia
  const commonTypos = [
    { from: ' yang', to: ' yg' },
    { from: ' tidak', to: ' gak' },
    { from: ' sudah', to: ' udah' },
    { from: ' akan', to: ' bakal' },
    { from: ' sangat', to: ' bener2' },
    { from: ' sekali', to: ' bgt' },
    { from: ' begitu', to: ' gitu' },
    { from: ' seperti', to: ' kayak' },
    { from: ' karena', to: ' soalnya' },
    { from: ' sekarang', to: ' skrg' }
  ];
  
  // Pilih random typo (30% chance dari yang bisa di-typo)
  if (Math.random() < 0.3) {
    const typo = commonTypos[Math.floor(Math.random() * commonTypos.length)];
    text = text.replace(typo.from, typo.to);
  }
  
  return text;
}
