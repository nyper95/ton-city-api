const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(
    'https://xkkifqxxglcuyruwkbih.supabase.co',
    'sb_publishable_4vyBOxq_vIumZ4EcXyNlsw_XPbJ2iKE'
);

app.get('/', (req, res) => {
    res.send('✅ Ton City API funcionando');
});

app.get('/reward', async (req, res) => {
    try {
        const userId = req.query.userId;
        
        if (!userId) {
            return res.status(400).json({ error: 'Falta userId' });
        }

        console.log(`🎁 Usuario ${userId} vio anuncio`);

        const { data: usuario } = await supabase
            .from('game_data')
            .select('diamonds')
            .eq('telegram_id', userId)
            .single();

        let nuevosDiamantes;
        
        if (!usuario) {
            nuevosDiamantes = 500;
            await supabase
                .from('game_data')
                .insert([{
                    telegram_id: userId,
                    diamonds: nuevosDiamantes,
                    lvl_tienda: 0,
                    lvl_casino: 0,
                    lvl_piscina: 0,
                    lvl_parque: 0,
                    lvl_diversion: 0,
                    last_seen: new Date().toISOString()
                }]);
        } else {
            nuevosDiamantes = (usuario.diamonds || 0) + 500;
            await supabase
                .from('game_data')
                .update({ 
                    diamonds: nuevosDiamantes,
                    last_seen: new Date().toISOString()
                })
                .eq('telegram_id', userId);
        }

        res.json({
            success: true,
            message: '+500 diamantes',
            diamonds: nuevosDiamantes
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT);
