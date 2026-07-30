const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');

let client = null;
let connectionStatus = 'disconnected';
let qrCodeString = null;

function conectarWhatsApp() {
    
    if (!fs.existsSync('.wwebjs_auth')) {
        fs.mkdirSync('.wwebjs_auth', { recursive: true });
    }
    
    client = new Client({
        authStrategy: new LocalAuth({
            dataPath: '.wwebjs_auth'
        }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        }
    });
    
    client.on('qr', (qr) => {
        qrCodeString = qr;
        connectionStatus = 'waiting_qr';
        console.log('📱 QR Code gerado! Acesse /qr');
    });
    
    client.on('ready', () => {
        connectionStatus = 'connected';
        qrCodeString = null;
        console.log('✅ WhatsApp conectado!');
    });
    
    client.on('disconnected', () => {
        connectionStatus = 'disconnected';
        qrCodeString = null;
        console.log('❌ Desconectado. Reconectando...');
        setTimeout(() => conectarWhatsApp(), 5000);
    });
    
    client.initialize().catch(err => {
        console.error('Erro ao iniciar:', err.message);
        connectionStatus = 'error';
        setTimeout(() => conectarWhatsApp(), 10000);
    });
}

async function enviarCodigoWhatsApp(numero, codigo) {
    if (!client || connectionStatus !== 'connected') {
        throw new Error('WhatsApp não está conectado');
    }
    
    const numeroLimpo = numero.replace(/\D/g, '');
    const numeroFormatado = '55' + numeroLimpo + '@c.us';
    
    const mensagem = `🔐 *CÓDIGO DE VERIFICAÇÃO*\n\n` +
                    `Seu código é: *${codigo}*\n\n` +
                    `⚠️ Não compartilhe com ninguém!\n` +
                    `⏰ Válido por 5 minutos`;
    
    await client.sendMessage(numeroFormatado, mensagem);
    console.log(`📱 Código ${codigo} enviado para ${numeroLimpo}`);
    return true;
}

function getStatus() {
    return connectionStatus;
}

function getQR() {
    return qrCodeString;
}

module.exports = {
    conectarWhatsApp,
    enviarCodigoWhatsApp,
    getStatus,
    getQR
};
