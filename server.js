// server.js

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); 
const cron = require('node-cron'); 

const app = express();
// ALTERAÇÃO AQUI: Usa a variável de ambiente PORT (do Render) ou 3000 localmente.
const port = process.env.PORT || 3000; 

// Define o caminho absoluto para a pasta 'promocao'
const promocoesPath = path.join(__dirname, 'promocao');

// USAR O CORS ANTES DE TODAS AS ROTAS
// ATENÇÃO: Em produção, configure o CORS para o seu domínio específico, não apenas app.use(cors());
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

// Agendar a tarefa para rodar todos os dias às 22:50 (50 22 * * *)
// ATENÇÃO: O Render utiliza UTC por padrão. 22:50 UTC pode ser um horário diferente no Brasil.
// Recomenda-se adicionar o timezone para garantir o horário desejado.
cron.schedule('50 22 * * *', () => {
    deletePromotionImages();
}, {
    scheduled: true,
    timezone: "America/Sao_Paulo" // Exemplo: para rodar 22:50 no fuso de São Paulo
});

console.log('Agendador de exclusão ativado para 22:50 todos os dias (usando o fuso horário configurado se aplicável).');

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
        
        // ALTERAÇÃO AQUI: Retorna caminhos relativos.
        const fileUrls = imageFiles.map(file => {
            return `/promocao/${file}`; 
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
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`As fotos estão disponíveis em: /promocao/`);
});