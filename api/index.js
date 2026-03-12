export default function handler(req, res) {
  return res.status(200).json({ 
    status: 'OK',
    endpoint: '/api',
    message: 'Vercel API Working!',
    timestamp: new Date().toISOString()
  });
}
```

**Commit**

### **Step 4: Import Project ke Vercel LAGI**

1. **Vercel Dashboard** → **Add New** → **Project**
2. **Import:** `hendy-unggul/jejak`
3. **Project Name:** `jejak-test` (nama beda lagi!)
4. **Framework:** Other
5. **Root Directory:** `./`
6. **Build/Output/Install:** **KOSONGKAN SEMUA**
7. **Deploy**

### **Step 5: Test Endpoint ROOT**
```
https://jejak-test.vercel.app/api
https://jejak-test.vercel.app/api/index
