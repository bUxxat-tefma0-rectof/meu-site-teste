require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const QRCode = require('qrcode');
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

app.get('/qr', async (req, res) => {
    const qr = getQR();
    const status = getStatus();
    
    if (status === 'connected') {
        return res.send(`<html><head><meta charset="UTF-8"><style>body{font-family:Arial;display:flex;justify-content:center;align-items:center;height:100vh;background:#f0f2f5;margin:0}.box{background:#fff;padding:40px;border-radius:20px;text-align:center}h2{color:#25D366}</style></head><body><div class="box"><h2>✅ Conectado!</h2><p>WhatsApp pronto</p></div></body></html>`);
    }
    
    if (!qr) {
        return res.send(`<html><head><meta charset="UTF-8"><style>body{font-family:Arial;display:flex;justify-content:center;align-items:center;height:100vh;background:#f0f2f5;margin:0}.box{background:#fff;padding:40px;border-radius:20px;text-align:center}.loader{width:50px;height:50px;border:5px solid #f3f3f3;border-top:5px solid #25D366;border-radius:50%;animation:spin 1s linear infinite;margin:20px auto}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style></head><body><div class="box"><h2>⏳ Gerando QR...</h2><div class="loader"></div><script>setTimeout(()=>location.reload(),5000)</script></div></body></html>`);
    }
    
    try {
        // Se for URL, mostra como imagem
        if (qr.startsWith('http')) {
            return res.send(`<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>body{font-family:Arial;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f2f5;margin:0;padding:20px}.box{background:#fff;padding:30px;border-radius:20px;text-align:center;max-width:350px;box-shadow:0 10px 40px rgba(0,0,0,.1)}h2{color:#25D366;margin:0 0 15px}.qrcode{border:3px solid #25D366;border-radius:15px;padding:10px;width:200px;height:200px}.inst{background:#fff9e6;padding:12px;border-radius:10px;margin-top:15px;text-align:left;font-size:13px}.inst strong{color:#856404}.inst ol{margin:5px 0 0 18px;color:#856404}.timer{color:#999;font-size:12px;margin-top:12px}</style></head><body><div class="box"><h2>📱 WhatsApp</h2><img src="${qr}" class="qrcode"><div class="inst"><strong>Escaneie:</strong><ol><li>Abra o WhatsApp</li><li>Aparelhos Conectados</li><li>Escanear QR Code</li></ol></div><p class="timer">Atualiza em 15s</p><script>setTimeout(()=>location.reload(),15000)</script></div></body></html>`);
        }
        
        // Se for base64
        const qrImage = await QRCode.toDataURL(qr);
        res.send(`<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>body{font-family:Arial;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f2f5;margin:0;padding:20px}.box{background:#fff;padding:30px;border-radius:20px;text-align:center;max-width:350px;box-shadow:0 10px 40px rgba(0,0,0,.1)}h2{color:#25D366}.qrcode{border:3px solid #25D366;border-radius:15px;padding:10px;width:200px;height:200px}.inst{background:#fff9e6;padding:12px;border-radius:10px;margin-top:15px;text-align:left;font-size:13px}.inst strong{color:#856404}.inst ol{margin:5px 0 0 18px;color:#856404}.timer{color:#999;font-size:12px;margin-top:12px}</style></head><body><div class="box"><h2>📱 WhatsApp</h2><img src="${qrImage}" class="qrcode"><div class="inst"><strong>Escaneie:</strong><ol><li>Abra o WhatsApp</li><li>Aparelhos Conectados</li><li>Escanear QR Code</li></ol></div><p class="timer">Atualiza em 15s</p><script>setTimeout(()=>location.reload(),15000)</script></div></body></html>`);
        
    } catch (e) {
        res.send('Erro ao gerar QR Code');
    }
});

app.post('/api/enviar-codigo', async (req, res) => {
    const { nome, sobrenome, telefone } = req.body;
    
    if (!nome || nome.trim().length < 2) return res.status(400).json({ sucesso: false, mensagem: 'Nome obrigatório' });
    if (!sobrenome || sobrenome.trim().length < 2) return res.status(400).json({ sucesso: false, mensagem: 'Sobrenome obrigatório' });
    
    const tel = telefone.replace(/\D/g, '');
    if (!tel || tel.length < 10) return res.status(400).json({ sucesso: false, mensagem: 'Telefone inválido' });
    if (getStatus() !== 'connected') return res.status(503).json({ sucesso: false, mensagem: 'Serviço indisponível' });
    
    try {
        const codigo = gerarCodigo();
        salvarCodigo(tel, codigo);
        await enviarCodigoWhatsApp(tel, codigo);
        res.json({ sucesso: true, mensagem: 'Código enviado!', telefone: tel });
    } catch (e) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao enviar' });
    }
});

app.post('/api/verificar-codigo', (req, res) => {
    const { nome, sobrenome, telefone, codigo } = req.body;
    const tel = telefone.replace(/\D/g, '');
    
    const resultado = verificarCodigo(tel, codigo);
    if (!resultado.valido) return res.status(400).json({ sucesso: false, mensagem: resultado.mensagem });
    
    const usuario = cadastrarUsuario(nome.trim(), sobrenome.trim(), tel);
    res.json({ sucesso: true, mensagem: 'Cadastro realizado!', usuario: { nome: usuario.nome, sobrenome: usuario.sobrenome } });
});

app.get('/api/status', (req, res) => {
    res.json({ status: getStatus() });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor na porta ${PORT}`);
    conectarWhatsApp();
});
