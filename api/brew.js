// ============================================
// GENERATE BATCH + SAVE TO SUPABASE (DENGAN DEBUG)
// ============================================
async function generateAndSaveSpills(count = 9) {
    console.log('[BREW] 🟢 START generateAndSaveSpills dengan count:', count);
    
    const characters = Object.keys(PERSONAS);
    const moods = ['surviving', 'thriving', 'chaotic', 'doom'];
    const spills = [];
    const aiEntriesToInsert = [];

    console.log('[BREW] 🔵 Generating', count, 'spills...');

    for (let i = 0; i < count; i++) {
        const char = characters[Math.floor(Math.random() * characters.length)];
        const mood = moods[Math.floor(Math.random() * moods.length)];

        console.log(`[BREW] 🟠 [${i+1}/${count}] Generating for ${char} (${mood})`);
        
        const content = await generateOneSpill(char, mood);
        
        console.log(`[BREW] 🟢 Content generated: ${content.substring(0, 50)}...`);

        const spill = {
            id: `ai_${Date.now()}_${i}_${Math.random().toString(36).slice(2)}`,
            author: char,
            mood: mood,
            content: content,
            timestamp: Date.now() - (i * 60000)
        };

        spills.push(spill);

        aiEntriesToInsert.push({
            user_id: 'ai_system',
            content: content,
            mood: mood,
            reactions: {
                skull: Math.floor(Math.random() * 15) + 2,
                cry: Math.floor(Math.random() * 25) + 5,
                fire: Math.floor(Math.random() * 20) + 1,
                upside: Math.floor(Math.random() * 8) + 1
            },
            created_at: new Date().toISOString()
        });

        // Delay biar ga overload API
        await new Promise(r => setTimeout(r, 200));
    }

    console.log('[BREW] 🟡 Generated', spills.length, 'spills, sekarang nyoba simpan ke Supabase...');

    // SIMPAN KE SUPABASE - DENGAN DEBUG
    try {
        console.log('[BREW] 🔵 Mencoba insert ke Supabase...');
        
        const { error, data } = await supabase
            .from('entries')
            .insert(aiEntriesToInsert)
            .select();

        if (error) {
            console.error('[BREW] ❌ ERROR INSERT SUPABASE:', error.message);
            console.error('[BREW] ❌ Detail error:', error);
        } else {
            console.log(`[BREW] ✅ ${aiEntriesToInsert.length} AI spills disimpan ke Supabase`);
            console.log('[BREW] 📦 Data:', data);
        }

        // Bersihin AI entries lama (keep 30 terbaru)
        console.log('[BREW] 🔵 Mencoba cleanup dengan RPC...');
        
        const { error: cleanupError } = await supabase
            .rpc('delete_old_ai_entries', { keep_count: 30 });

        if (cleanupError) {
            console.log('[BREW] ⚠️ Cleanup skip:', cleanupError.message);
        } else {
            console.log('[BREW] ✅ AI entries lama dibersihkan');
        }
        
    } catch (dbError) {
        console.error('[BREW] ❌❌❌ EXCEPTION SUPABASE:', dbError.message);
        console.error('[BREW] Stack:', dbError.stack);
    }

    console.log('[BREW] 🟢 FINISH generateAndSaveSpills, return', spills.length, 'spills');
    return spills;
}
