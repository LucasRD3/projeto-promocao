// server.js

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); 
const cron = require('node-cron');

// O Render injeta a porta no processo.env.PORT
// Se não existir (como localmente), usa 3000
const port = process.env.PORT || 3000; 
// O Render fornece a URL pública em process.env.RENDER_EXTERNAL_URL
const publicUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;

// ... (Resto do código) ...

// Rota para Listar as Fotos
app.get('/api/fotos', (req, res) => {
    // ... (Código para ler o diretório) ...

    // Retorna a lista de URLs completas para as fotos
    const fileUrls = imageFiles.map(file => {
        // MUDE ESTA LINHA: use a variável 'publicUrl' em vez de 'localhost:${port}'
        return `${publicUrl}/promocao/${file}`; 
    });

    res.json(fileUrls);
});

// ... (Resto do código) ...

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em ${publicUrl}`);
    console.log(`As fotos estão disponíveis em: ${publicUrl}/promocao/`);
});