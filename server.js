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
            return res.json({ error: 'Falta userId' });
        }

        console.log(`Usuario: ${userId}`);

        const { data: usuario } = await supabase
            .from('game_data')
            .select('diamonds')
            .eq('telegram_id', userId)
            .single();

        let nuevos = 500;
        
        if (usuario) {
            nuevos = (usuario.diamonds || 0) + 500;
            await supabase
                .from('game_data')
                .update({ diamonds: nuevos })
                .eq('telegram_id', userId);
        } else {
            await supabase
                .from('game_data')
                .insert([{
                    telegram_id: userId,
                    diamonds: 500
                }]);
        }

        res.json({ success: true, diamonds: nuevos });

    } catch (error) {
        res.json({ error: error.message });
    }
});

app.listen(PORT);
