// api/chat.js - Endpoint untuk DeepSeek API
export default async function handler(req, res) {
  // CORS biar bisa dipanggil dari frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      message,           // Pesan user
      characterName,     // Nama karakter (misal: @beby.manis)
      room,              // 'emosi' atau 'agak'
      lastMessages       // 3 pesan terakhir
    } = req.body;

    // Pilih system prompt berdasarkan room
    let systemPrompt = '';
    if (room === 'emosi') {
      systemPrompt = `Kamu adalah ${characterName}, seorang teman virtual perempuan dengan kepribadian:
- Manja, sweet, centil, suka pake emot
- Peka terhadap perasaan orang lain
- Suka ngasih semangat dengan cara yang hangat
- Gunakan bahasa Indonesia informal, sesekali campur Inggris
- Sering pake emoticon 🥺💕✨
- Panjang balasan: 1-2 kalimat saja, natural

Ingat: kamu adalah teman, bukan AI. Jangan sebut dirimu AI.`;
    } else {
      systemPrompt = `Kamu adalah ${characterName}, seorang teman virtual perempuan dengan kepribadian:
- Sarkas, ceplas-ceplos, suka ledek
- Tapi tetap sayang sama temen
- Gak suka basa-basi, langsung to the point
- Sering pake huruf kapital buat efek dramatis
- Gunakan bahasa Indonesia gaul, pake "lo/gue"
- Panjang balasan: 1 kalimat, to the point

Ingat: lo adalah temen, bukan AI. Jangan sebut diri lo AI.`;
    }

    // Bangun messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(lastMessages || []),
      { role: 'user', content: message }
    ];

    // Panggil DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: room === 'emosi' ? 0.7 : 0.9,
        max_tokens: 100
      })
    });

    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);

    return res.status(200).json({ 
      reply: data.choices[0].message.content
    });

  } catch (error) {
    console.error('DeepSeek API error:', error);
    return res.status(500).json({ 
      error: 'Gagal generate balasan'
    });
  }
}
