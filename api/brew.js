// ============================================
// ENDPOINT BREW (POST) - VERSI AMAN
// ============================================
router.post('/brew', async (req, res) => {
    try {
        // Set timeout lebih panjang
        req.setTimeout(30000); // 30 detik
        
        // Ambil count dari body, default 3
        const count = req.body?.count || 3;
        
        console.log('[BREW] 📥 POST /brew called with count:', count);
        
        // Batasi maksimal 5 biar ga overload
        const safeCount = Math.min(count, 5);
        
        const spills = await generateAndSaveSpills(safeCount);
        
        return res.json({
            success: true,
            spills: spills,
            count: spills.length
        });
        
    } catch (error) {
        console.error('[BREW] ❌ Error:', error);
        
        // Fallback: return dummy data
        const dummySpills = [];
        for (let i = 0; i < 3; i++) {
            dummySpills.push({
                id: `fallback_${Date.now()}_${i}`,
                author: 'beby.manis',
                mood: 'surviving',
                content: 'fallback dari server',
                timestamp: Date.now(),
                wordCount: 3,
                reactions: { skull: 5, cry: 3, fire: 2, upside: 1 }
            });
        }
        
        return res.json({
            success: true,
            spills: dummySpills,
            count: dummySpills.length,
            fallback: true
        });
    }
});
