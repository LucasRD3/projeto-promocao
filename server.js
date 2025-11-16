const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
// O Railway injeta a variável PORT automaticamente, garantindo o funcionamento.
const PORT = process.env.PORT || 8080; 
// Usa o separador de caminho do sistema operacional para robustez
const PROMO_DIR = path.sep + 'promocao'; 

// Lista de extensões de arquivo que consideramos como imagens
const IMAGE_EXTENSIONS = [
    '.jpg', '.jpeg', '.png', '.gif', 
    '.webp', '.bmp', '.svg', '.avif' // Adicionada AVIF, uma extensão moderna
];

// ===============================================
// 1. CONFIGURAÇÃO DE CORS
// Permite que qualquer frontend acesse os recursos
// ===============================================
app.use((req, res, next) => {
    // Permite requisições de qualquer origem (*)
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Define os métodos HTTP permitidos
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    // Define os cabeçalhos permitidos
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Responde a requisições OPTIONS imediatamente (pré-voo CORS)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ===============================================
// 2. SERVIÇO DE ARQUIVOS ESTÁTICOS
// Qualquer arquivo na pasta 'promocao' estará acessível em /promocao/*
// URL de exemplo: https://<seu-dominio-railway>/promocao/imagem1.jpg
// O .slice(1) remove a barra inicial para a rota
// ===============================================
app.use(PROMO_DIR.slice(1), express.static(path.join(__dirname, PROMO_DIR)));

// ===============================================
// 3. ROTA API - /api/fotos
// Retorna a lista de URLs das imagens
// ===============================================
app.get('/api/fotos', (req, res) => {
    // O path.join(..., PROMO_DIR) já lida com o separador de caminho
    const promoPath = path.join(__dirname, PROMO_DIR);
    
    // 1. Verifica se a pasta existe
    if (!fs.existsSync(promoPath)) {
        console.error(`Diretório não encontrado: ${PROMO_DIR}`);
        // Manteve o status 500, mas 404 seria tecnicamente defensável para recursos ausentes
        return res.status(500).json({ error: 'Diretório de promoções não encontrado.' });
    }

    try {
        // 2. Lê o conteúdo da pasta
        const files = fs.readdirSync(promoPath);
        
        // 3. Filtra apenas os arquivos de imagem e mapeia para URLs
        const imageURLs = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return IMAGE_EXTENSIONS.includes(ext);
            })
            .map(file => {
                // Constrói a URL completa da imagem.
                // req.protocol e req.get('host') garantem que o link use HTTPS e o domínio do Railway.
                return `${req.protocol}://${req.get('host')}${PROMO_DIR.replace(/\\/g, '/')}/${file}`;
            });

        // 4. Retorna a lista de URLs
        res.json(imageURLs);

    } catch (error) {
        console.error('Erro ao ler o diretório de promoções:', error);
        res.status(500).json({ error: 'Falha ao processar a lista de fotos.' });
    }
});

// Rota de saúde simples (Health Check)
app.get('/', (req, res) => {
    res.send('Servidor de Carrossel de Promoções está ativo!');
});

// Inicializa o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});