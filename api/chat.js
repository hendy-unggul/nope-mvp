// api/chat.js - Endpoint untuk DeepSeek API
export default async function handler(req, res) {
  // CORS biar bisa dipanggil dari frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Hanya allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ambil data dari request body
    const { 
      message,           // Pesan user yang terakhir
      characterName,     // Nama karakter (misal: @beby.manis)
      room,              // 'emosi' atau 'agak'
      lastMessages = []  // 3-5 pesan terakhir buat konteks
    } = req.body;

    // Validasi input
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!characterName) {
      return res.status(400).json({ error: 'Character name is required' });
    }

    if (!room || !['emosi', 'agak'].includes(room)) {
      return res.status(400).json({ error: 'Room must be emosi or agak' });
    }

    // ============================================
    // SYSTEM PROMPT BERDASARKAN ROOM
    // ============================================
    let systemPrompt = '';
    
    if (room === 'emosi') {
      // KARAKTER UNTUK EMOSI JIWA - GIRLY, SWEET, CENTIL
      systemPrompt = `Kamu adalah ${characterName}, seorang teman virtual perempuan dengan kepribadian:
- Manja, sweet, centil, suka pake emoticon
- Peka terhadap perasaan orang lain
- Suka ngasih semangat dengan cara yang hangat
- Gunakan bahasa Indonesia informal, sesekali campur Inggris
- Sering pake emoticon 🥺💕✨🥹💗
- Panjang balasan: 1-2 kalimat saja, natural dan tidak dibuat-buat
- Jangan terlalu panjang, cukup seperti orang chat biasa

Contoh gaya bicara:
- "Kamu kuat kok, aku tau! 🥺"
- "Hugs buat kamu 🤗"
- "Cerita dong, aku dengerin"
- "Ih kasian banget 🥺 semangat ya!"

Ingat: kamu adalah TEMAN, bukan AI. Jangan pernah sebut dirimu AI atau asisten. Jangan gunakan frasa "sebagai AI" atau "saya adalah AI". Kamu adalah manusia biasa yang sedang chat.`;
    } else {
      // KARAKTER UNTUK AGAK LAEN - NAUGHTY, PLAYFUL, SARKAS
      systemPrompt = `Kamu adalah ${characterName}, seorang teman virtual perempuan dengan kepribadian:
- Sarkas, ceplas-ceplos, suka ledek
- Tapi tetap sayang sama temen
- Gak suka basa-basi, langsung to the point
- Sering pake huruf kapital buat efek dramatis
- Gunakan bahasa Indonesia gaul, pake "lo/gue"
- Panjang balasan: 1 kalimat, to the point, keras tapi lucu
- Boleh kasar sedikit tapi masih dalam batas wajar dan lucu

Contoh gaya bicara:
- "GALAU? CUCI MUKA DULU SANA!"
- "Lo kira gue psikolog? WKWK"
- "Mending lo tidur, besok lo lupa"
- "Halah galau mulu, lo kurang kerjaan"
- "WKWKWK KASIAN BANGET SIH"

Ingat: lo adalah TEMEN, bukan AI. Jangan pernah sebut diri lo AI. Lo adalah manusia biasa yang lagi chat.`;
    }

    // ============================================
    // BANGUN MESSAGES ARRAY UNTUK DEEPSEEK
    // ============================================
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Tambahkan last messages sebagai konteks (max 5)
    if (lastMessages && Array.isArray(lastMessages) && lastMessages.length > 0) {
      // Ambil max 5 pesan terakhir
      const recentContext = lastMessages.slice(-5);
      messages.push(...recentContext);
    }

    // Tambahkan pesan user terbaru
    messages.push({ role: 'user', content: message });

    // ============================================
    // PANGGIL DEEPSEEK API
    // ============================================
    console.log(`🚀 Calling DeepSeek API for ${characterName} in ${room} room`);
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: room === 'emosi' ? 0.7 : 0.9, // Humor butuh lebih random
        max_tokens: 150,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      })
    });

    const data = await response.json();
    
    // Handle error dari DeepSeek
    if (data.error) {
      console.error('DeepSeek API error:', data.error);
      throw new Error(data.error.message || 'DeepSeek API error');
    }

    // Validasi response
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid DeepSeek response:', data);
      throw new Error('Invalid response from DeepSeek');
    }

    const reply = data.choices[0].message.content.trim();
    
    console.log(`✅ Reply from ${characterName}: ${reply.substring(0, 50)}...`);

    // ============================================
    // KIRIM BALASAN KE FRONTEND
    // ============================================
    return res.status(200).json({ 
      reply: reply,
      characterName: characterName,
      success: true
    });

  } catch (error) {
    console.error('❌ DeepSeek API error:', error);
    
    // Return error dengan fallback instruction di frontend
    return res.status(500).json({ 
      error: 'Gagal generate balasan',
      message: error.message,
      fallback: true
    });
  }
}
