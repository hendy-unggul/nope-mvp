module.exports = (req, res) => {
  res.status(200).json({ 
    status: 'API Works!',
    timestamp: new Date().toISOString()
  });
};
```

### **Step 3: Tunggu Vercel Auto-Deploy**

1. Buka **Vercel Dashboard**: https://vercel.com/dashboard
2. Pilih project **jejak-six**
3. Tab **Deployments**
4. Tunggu deployment baru muncul & selesai (ada ✅ hijau)
5. Biasanya 1-2 menit

### **Step 4: Test Endpoint**

**Di browser, buka:**
```
https://jejak-six.vercel.app/api/test
