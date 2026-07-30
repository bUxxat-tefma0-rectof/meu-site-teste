const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');

let client = null;
let connectionStatus = 'disconnected';
let qrCodeString = null;

function conectarWhatsApp() {
    return new Promise((resolve) => {
        
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
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
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
            resolve(client);
        });
        
        client.on('disconnected', (reason) => {
            connectionStatus = 'disconnected';
            qrCodeString = null;
            console.log('❌ Desconectado:', reason);
            setTimeout(() => conectarWhatsApp(), 5000);
        });
        
        client.on('auth_failure', (msg) => {
            connectionStatus = 'auth_failure';
            console.log('❌ Falha autenticação:', msg);
            fs.rmSync('.wwebjs_auth', { recursive: true, force: true });
            setTimeout(() => conectarWhatsApp(), 5000);
        });
        
        client.initialize();
    });
}

async function enviarCodigoWhatsApp(numero, codigo) {
    if (!client || connectionStatus !== 'connected') {
        throw new Error('WhatsApp não está conectado');
    }
    
    try {
        const numeroFormatado = '55' + numero.replace(/\D/g, '') + '@c.us';
        
        const mensagem = `🔐 *CÓDIGO DE VERIFICAÇÃO*\n\n` +
                        `Seu código é: *${codigo}*\n\n` +
                        `⚠️ Não compartilhe com ninguém!\n` +
                        `⏰ Válido por 5 minutos`;
        
        await client.sendMessage(numeroFormatado, mensagem);
        console.log(`📱 Código ${codigo} enviado para ${numero}`);
        return true;
        
    } catch (error) {
        console.error('Erro ao enviar:', error.message);
        throw new Error('Não foi possível enviar o código');
    }
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
