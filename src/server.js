require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { conectarWhatsApp, enviarCodigoWhatsApp, getStatus, getQR } = require('./whatsapp');
const { salvarCodigo, verificarCodigo, cadastrarUsuario, gerarCodigo } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/qr', (req, res) => {
    const qr = getQR();
    const status = getStatus();
    
    if (status === 'connected') {
        return res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f2f5}.box{background:#fff;padding:40px;border-radius:20px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.1)}.emoji{font-size:60px}h2{color:#25D366;margin:15px 0}p{color:#666}</style></head><body><div class="box"><div class="emoji">✅</div><h2>WhatsApp Conectado!</h2><p>Pronto para enviar códigos</p></div></body></html>`);
    }
    
    if (!qr) {
        return res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f2f5}.box{background:#fff;padding:40px;border-radius:20px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.1)}.loader{width:50px;height:50px;border:5px solid #f3f3f3;border-top:5px solid #25D366;border-radius:50%;animation:spin 1s linear infinite;margin:20px auto}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}h2{color:#333}p{color:#999;margin-top:10px}</style></head><body><div class="box"><h2>⏳ Gerando QR Code...</h2><div class="loader"></div><p>Aguarde um momento</p><script>setTimeout(()=>location.reload(),5000)</script></div></body></html>`);
    }
    
    const QRCode = require('qrcode');
    const qrDataUrl = QRCode.toDataURL(qr);
    
    // AQUI USAMOS O QRCODE DO LADO DO SERVIDOR
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><script>
    fetch('/api/qr-image')
        .then(r => r.text())
        .then(qrHtml => {
            document.getElementById('qr-container').innerHTML = qrHtml;
        });
    </script><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f2f5;padding:20px}.box{background:#fff;padding:30px;border-radius:20px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.1);max-width:400px}h2{color:#25D366;margin-bottom:5px;font-size:22px}.sub{color:#666;margin-bottom:20px;font-size:14px}.instrucoes{background:#fff9e6;padding:15px;border-radius:10px;margin-top:20px;text-align:left;font-size:13px}.instrucoes strong{color:#856404}.instrucoes ol{margin:8px 0 0 20px;color:#856404}.instrucoes li{margin:5px 0}.timer{color:#999;font-size:12px;margin-top:15px}#qr-container{margin:10px 0}</style></head><body><div class="box"><h2>📱 WhatsApp</h2><p class="sub">Escaneie o QR Code</p><div id="qr-container"><img src="${qrDataUrl}" style="width:250px;height:250px;border:3px solid #25D366;border-radius:15px;padding:10px"></div><div class="instrucoes"><strong>📋 Como escanear:</strong><ol><li>Abra o WhatsApp no celular</li><li>Aparelhos Conectados</li><li>Escanear QR Code</li></ol></div><p class="timer">Atualiza em 15 segundos</p><script>setTimeout(()=>location.reload(),15000)</script></div></body></html>`);
});

app.post('/api/enviar-codigo', async (req, res) => {
    try {
        const { nome, sobrenome, telefone } = req.body;
        
        if (!nome || nome.trim().length < 2) {
            return res.status(400).json({ sucesso: false, mensagem: 'Nome é obrigatório' });
        }
        if (!sobrenome || sobrenome.trim().length < 2) {
            return res.status(400).json({ sucesso: false, mensagem: 'Sobrenome é obrigatório' });
        }
        
        const telefoneLimpo = telefone.replace(/\D/g, '');
        if (!telefoneLimpo || telefoneLimpo.length < 10) {
            return res.status(400).json({ sucesso: false, mensagem: 'Telefone inválido' });
        }
        
        if (getStatus() !== 'connected') {
            return res.status(503).json({ sucesso: false, mensagem: 'Serviço indisponível' });
        }
        
        const codigo = gerarCodigo();
        salvarCodigo(telefoneLimpo, codigo);
        await enviarCodigoWhatsApp(telefoneLimpo, codigo);
        
        console.log(`📤 Código ${codigo} enviado para ${telefoneLimpo}`);
        
        res.json({ sucesso: true, mensagem: 'Código enviado!', telefone: telefoneLimpo });
        
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao enviar código' });
    }
});

app.post('/api/verificar-codigo', (req, res) => {
    try {
        const { nome, sobrenome, telefone, codigo } = req.body;
        const telefoneLimpo = telefone.replace(/\D/g, '');
        
        const resultado = verificarCodigo(telefoneLimpo, codigo);
        
        if (!resultado.valido) {
            return res.status(400).json({ sucesso: false, mensagem: resultado.mensagem });
        }
        
        const usuario = cadastrarUsuario(nome.trim(), sobrenome.trim(), telefoneLimpo);
        
        console.log(`✅ Cadastrado: ${usuario.nome} ${usuario.sobrenome}`);
        
        res.json({ 
            sucesso: true, 
            mensagem: 'Cadastro realizado!',
            usuario: { nome: usuario.nome, sobrenome: usuario.sobrenome, telefone: usuario.telefone }
        });
        
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao verificar' });
    }
});

app.get('/api/status', (req, res) => {
    res.json({ status: getStatus(), conectado: getStatus() === 'connected' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor na porta ${PORT}`);
    console.log('📱 Conectando WhatsApp...');
    conectarWhatsApp();
});
