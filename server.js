const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
// Koyeb usa el puerto 8000 por defecto, pero process.env.PORT lo detectará
const PORT = process.env.PORT || 8000; 

const supabase = createClient(
    'https://xkkifqxxglcuyruwkbih.supabase.co',
    'TU_SERVICE_ROLE_KEY_AQUI' // Usa variables de entorno preferiblemente
);

app.get('/', (req, res) => {
    res.send('✅ Ton City API funcionando correctamente');
});

app.get('/reward', async (req, res) => {
    try {
        const userId = req.query.userId;
        
        if (!userId) {
            return res.status(400).json({ error: 'Falta userId' });
        }

        // Buscamos al usuario
        const { data: usuario, error: fetchError } = await supabase
            .from('game_data')
            .select('diamonds')
            .eq('telegram_id', userId)
            .maybeSingle(); // maybeSingle no da error si no encuentra nada

        if (fetchError) throw fetchError;

        let nuevos = 500;
        
        if (usuario) {
            nuevos = (usuario.diamonds || 0) + 500;
            const { error: updError } = await supabase
                .from('game_data')
                .update({ diamonds: nuevos })
                .eq('telegram_id', userId);
            if (updError) throw updError;
        } else {
            const { error: insError } = await supabase
                .from('game_data')
                .insert([{ telegram_id: userId, diamonds: 500 }]);
            if (insError) throw insError;
        }

        res.json({ success: true, diamonds: nuevos });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// IMPORTANTE: 0.0.0.0 para que Koyeb pueda ver el puerto
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});
