export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { message, characterName } = req.body || {};
  
  const replies = [
    'hmm cerita dong',
    'oh gitu, terus?',
    'iya lanjutin'
  ];
  
  const reply = replies[Math.floor(Math.random() * replies.length)];
  
  return res.status(200).json({
    reply,
    character: characterName || 'unknown',
    mode: 'offline'
  });
}
```

---

## 🚀 Setelah Edit:

1. **Commit** semua perubahan
2. **Tunggu** Vercel auto-deploy (1-2 menit)
3. **Test:**
```
   https://jejak-spxll.vercel.app/api/hello
   https://jejak-spxll.vercel.app/api/test
