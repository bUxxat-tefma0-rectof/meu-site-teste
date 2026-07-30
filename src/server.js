require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { conectarWhatsApp, enviarCodigoWhatsApp, getStatus, getQR } = require('./whatsapp');
const { salvarCodigo, verificarCodigo, cadastrarUsuario, gerarCodigo } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ============================================
// ROTAS DA PÁGINA
// ============================================

// Rota principal - Página de cadastro
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Rota para ver QR Code do WhatsApp
app.get('/qr', (req, res) => {
    const qr = getQR();
    const status = getStatus();
    
    // Se já estiver conectado
    if (status === 'connected') {
        return res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>QR Code WhatsApp</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            text-align: center;
                            padding: 50px;
                            background: #f0f2f5;
                        }
                        .card {
                            background: white;
                            padding: 40px;
                            border-radius: 15px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            max-width: 500px;
                            margin: 0 auto;
                        }
                        .check {
                            font-size: 80px;
                        }
                        h2 { color: #25D366; }
                        p { color: #666; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="check">✅</div>
                        <h2>WhatsApp Conectado!</h2>
                        <p>Seu WhatsApp Business está online e pronto para enviar códigos.</p>
                        <p style="font-size: 14px; margin-top: 20px;">Status: <strong>${status}</strong></p>
                        <script>setTimeout(() => location.reload(), 10000);</script>
                    </div>
                </body>
            </html>
        `);
    }
    
    // Se ainda não tem QR Code
    if (!qr) {
        return res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>QR Code WhatsApp</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            text-align: center;
                            padding: 50px;
                            background: #f0f2f5;
                        }
                        .card {
                            background: white;
                            padding: 40px;
                            border-radius: 15px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            max-width: 500px;
                            margin: 0 auto;
                        }
                        .spinner {
                            width: 60px;
                            height: 60px;
                            border: 6px solid #f3f3f3;
                            border-top: 6px solid #25D366;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin: 20px auto;
                        }
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        h2 { color: #333; }
                        p { color: #666; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h2>⏳ Aguardando QR Code...</h2>
                        <div class="spinner"></div>
                        <p>Gerando conexão com WhatsApp...</p>
                        <p style="font-size: 14px; color: #999;">Status: ${status}</p>
                        <script>setTimeout(() => location.reload(), 5000);</script>
                    </div>
                </body>
            </html>
        `);
    }
    
    // Mostra QR Code
    res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>QR Code WhatsApp</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 20px;
                        background: #f0f2f5;
                    }
                    .card {
                        background: white;
                        padding: 40px;
                        border-radius: 15px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        max-width: 500px;
                        margin: 0 auto;
                    }
                    h2 { color: #25D366; }
                    p { color: #666; }
                    .instructions {
                        background: #fff3cd;
                        padding: 15px;
                        border-radius: 10px;
                        margin: 20px 0;
                        text-align: left;
                    }
                    .instructions ol {
                        margin: 10px 0;
                        padding-left: 20px;
                    }
                    .instructions li {
                        margin: 8px 0;
                        color: #856404;
                    }
                    #qrcode {
                        display: inline-block;
                        background: white;
                        padding: 20px;
                        border-radius: 10px;
                        border: 3px solid #25D366;
                    }
                    .timer {
                        margin-top: 20px;
                        color: #999;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>📱 Escaneie o QR Code</h2>
                    <p>Conecte seu WhatsApp Business</p>
                    
                    <div class="instructions">
                        <strong>📋 Instruções:</strong>
                        <ol>
                            <li>Abra o WhatsApp no seu celular</li>
                            <li>Toque em <strong>Aparelhos Conectados</strong></li>
                            <li>Toque em <strong>Escanear QR Code</strong></li>
                            <li>Aponte a câmera para o código abaixo</li>
                        </ol>
                    </div>
                    
                    <div id="qrcode"></div>
                    
                    <p class="timer">⏰ QR Code atualiza automaticamente a cada 15 segundos</p>
                </div>
                
                <script>
                    new QRCode(document.getElementById("qrcode"), {
                        text: "${qr}",
                        width: 300,
                        height: 300,
                        colorDark: "#000000",
                        colorLight: "#ffffff"
                    });
                    setTimeout(() => location.reload(), 15000);
                </script>
            </body>
        </html>
    `);
});

// ============================================
// ROTAS DA API
// ============================================

// Rota: Enviar código de verificação
app.post('/api/enviar-codigo', async (req, res) => {
    try {
        const { nome, sobrenome, telefone } = req.body;
        
        // Validações
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
        
        const telefoneLimpo = telefone.replace(/\D/g, '');
        if (!telefoneLimpo || telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
            return res.status(400).json({ 
                sucesso: false, 
                mensagem: 'Telefone inválido. Use DDD + número' 
            });
        }
        
        // Verifica se WhatsApp está conectado
        if (getStatus() !== 'connected') {
            return res.status(503).json({ 
                sucesso: false, 
                mensagem: 'Serviço de WhatsApp indisponível no momento. Tente novamente em instantes.' 
            });
        }
        
        // Gera código de 6 dígitos
        const codigo = gerarCodigo();
        
        // Salva código temporariamente (expira em 5 minutos)
        salvarCodigo(telefoneLimpo, codigo);
        
        // Envia código via WhatsApp
        await enviarCodigoWhatsApp(telefoneLimpo, codigo);
        
        console.log(`📤 Código ${codigo} enviado para ${telefoneLimpo}`);
        
        res.json({ 
            sucesso: true, 
            mensagem: 'Código enviado com sucesso! Verifique seu WhatsApp.',
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

// Rota: Verificar código e finalizar cadastro
app.post('/api/verificar-codigo', (req, res) => {
    try {
        const { nome, sobrenome, telefone, codigo } = req.body;
        
        const telefoneLimpo = telefone.replace(/\D/g, '');
        
        // Verifica o código
        const resultado = verificarCodigo(telefoneLimpo, codigo);
        
        if (!resultado.valido) {
            return res.status(400).json({ 
                sucesso: false, 
                mensagem: resultado.mensagem 
            });
        }
        
        // Cadastra o usuário
        const usuario = cadastrarUsuario(nome.trim(), sobrenome.trim(), telefoneLimpo);
        
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
            mensagem: 'Erro ao verificar código. Tente novamente.' 
        });
    }
});

// Rota: Status do WhatsApp
app.get('/api/status', (req, res) => {
    res.json({ 
        status: getStatus(),
        conectado: getStatus() === 'connected'
    });
});

// Rota: Health check (para Render)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        whatsapp: getStatus(),
        timestamp: new Date().toISOString()
    });
});

// ============================================
// INICIA SERVIDOR
// ============================================

app.listen(PORT, () => {
    console.log('============================================');
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Site: http://localhost:${PORT}`);
    console.log(`📱 QR Code: http://localhost:${PORT}/qr`);
    console.log('============================================');
    console.log('📱 Conectando WhatsApp Business...');
    conectarWhatsApp();
});
