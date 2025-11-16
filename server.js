// server.js

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); 
const cron = require('node-cron'); // <--- NOVO: Importar node-cron

const app = express();
const port = 3000; 

// Define o caminho absoluto para a pasta 'promocao'
const promocoesPath = path.join(__dirname, 'promocao');

// USAR O CORS ANTES DE TODAS AS ROTAS
app.use(cors()); 

// Configura a pasta 'promocao' como um diretório estático.
app.use('/promocao', express.static(promocoesPath));

// =========================================================
// FUNÇÃO DE AGENDAMENTO (DELETAR ARQUIVOS)
// =========================================================

/**
 * Função responsável por ler a pasta 'promocao' e deletar 
 * todos os arquivos de imagem (jpg, jpeg, png, gif).
 */
function deletePromotionImages() {
    console.log('--- Iniciando a exclusão de arquivos da pasta promocao ---');
    
    fs.readdir(promocoesPath, (err, files) => {
        if (err) {
            console.error('Erro ao ler o diretório:', err);
            return;
        }

        // Filtra apenas arquivos de imagem
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

        if (imageFiles.length === 0) {
            console.log('Nenhum arquivo de imagem encontrado para exclusão.');
            return;
        }
        
        console.log(`Encontrados ${imageFiles.length} arquivos para exclusão.`);

        imageFiles.forEach(file => {
            const filePath = path.join(promocoesPath, file);
            
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Erro ao deletar o arquivo ${file}:`, err);
                } else {
                    console.log(`Arquivo deletado com sucesso: ${file}`);
                }
            });
        });
        
        console.log('--- Processo de exclusão concluído ---');
    });
}

// NOVO: Agendar a tarefa para rodar todos os dias às 22:50 (50 22 * * *)
// O formato é: minuto, hora, dia_do_mês, mês, dia_da_semana
cron.schedule('50 22 * * *', () => {
    deletePromotionImages();
}, {
    scheduled: true,
    // O fuso horário utilizado será o do servidor onde o Node.js está rodando.
    // Para garantir a precisão, você pode adicionar a opção: timezone: "America/Sao_Paulo"
});

console.log('Agendador de exclusão ativado para 22:50 todos os dias.');

// =========================================================
// ROTAS EXISTENTES
// =========================================================

// Rota para Listar as Fotos (mantida a lógica de listagem)
app.get('/api/fotos', (req, res) => {
    // Lê o conteúdo do diretório
    fs.readdir(promocoesPath, (err, files) => {
        if (err) {
            console.error('Erro ao ler o diretório:', err);
            return res.status(500).send('Erro interno do servidor.');
        }

        // Filtra apenas arquivos de imagem 
        const imageFiles = files.filter(file => {
            return /\.(jpg|jpeg|png|gif)$/i.test(file);
        });
        
        // Retorna a lista de URLs completas para as fotos
        const fileUrls = imageFiles.map(file => {
            return `http://localhost:${port}/promocao/${file}`;
        });

        res.json(fileUrls);
    });
});

// Rota de Teste Simples (Home)
app.get('/', (req, res) => {
    res.send('O servidor de promoções está rodando! Acesse /api/fotos para a lista de URLs.');
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`As fotos estão disponíveis em: http://localhost:${port}/promocao/`);
});