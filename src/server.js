require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { conectarWhatsApp, enviarCodigoWhatsApp, getStatus } = require('./whatsapp');
const { salvarCodigo, verificarCodigo, cadastrarUsuario, gerarCodigo } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Rota: Enviar código
app.post('/api/enviar-codigo', async (req, res) => {
    try {
        const { nome, sobrenome, telefone } = req.body;
        
        // Validações básicas
        if (!nome || nome.trim().length < 2) {
            return res.status(400).json({ 
                sucesso: false, 
                mensagem: 'Nome é obrigatório (mínimo 2 caracteres)' 
            });
        }
        
        if (!sobrenome || sobrenome.trim().length < 2) {
            return res.status(400).json({ 
                sucesso: false, 
                mensagem: 'Sobrenome é obrigatório (mínimo 2 caracteres)' 
            });
        }
        
        if (!telefone || telefone.replace(/\D/g, '').length < 10) {
            return res.status(400).json({ 
                sucesso: false, 
                mensagem: 'Telefone inválido' 
            });
        }
        
        // Verifica se WhatsApp está conectado
        if (getStatus() !== 'connected') {
            return res.status(503).json({ 
                sucesso: false, 
                mensagem: 'Serviço de WhatsApp indisponível. Tente novamente em instantes.' 
            });
        }
        
        // Gera e salva código
        const codigo = gerarCodigo();
        const telefoneLimpo = telefone.replace(/\D/g, '');
        salvarCodigo(telefoneLimpo, codigo);
        
        // Envia via WhatsApp
        await enviarCodigoWhatsApp(telefoneLimpo, codigo);
        
        console.log(`📤 Código ${codigo} enviado para ${telefoneLimpo}`);
        
        res.json({ 
            sucesso: true, 
            mensagem: 'Código enviado com sucesso!',
            telefone: telefoneLimpo
        });
        
    } catch (error) {
        console.error('Erro ao enviar código:', error);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro ao enviar código. Tente novamente.' 
        });
    }
});

// Rota: Verificar código
app.post('/api/verificar-codigo', (req, res) => {
    try {
        const { nome, sobrenome, telefone, codigo } = req.body;
        
        const telefoneLimpo = telefone.replace(/\D/g, '');
        
        // Verifica código
        const resultado = verificarCodigo(telefoneLimpo, codigo);
        
        if (!resultado.valido) {
            return res.status(400).json({ 
                sucesso: false, 
                mensagem: resultado.mensagem 
            });
        }
        
        // Cadastra usuário
        const usuario = cadastrarUsuario(nome, sobrenome, telefoneLimpo);
        
        console.log(`✅ Usuário cadastrado: ${usuario.nome} ${usuario.sobrenome} - ${usuario.telefone}`);
        
        res.json({ 
            sucesso: true, 
            mensagem: 'Cadastro realizado com sucesso!',
            usuario: {
                nome: usuario.nome,
                sobrenome: usuario.sobrenome,
                telefone: usuario.telefone
            }
        });
        
    } catch (error) {
        console.error('Erro ao verificar código:', error);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro ao verificar código' 
        });
    }
});

// Rota: Status do WhatsApp
app.get('/api/status', (req, res) => {
    res.json({ 
        status: getStatus() 
    });
});

// Inicia servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log('📱 Conectando WhatsApp...');
    conectarWhatsApp();
});
