const { Client, LocalAuth } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');
const fs = require('fs');

let client = null;
let connectionStatus = 'disconnected';
let qrCodeString = null;

async function conectarWhatsApp() {
    
    if (!fs.existsSync('.wwebjs_auth')) {
        fs.mkdirSync('.wwebjs_auth', { recursive: true });
    }
    
    // Encontra o chromium que veio com puppeteer
    const browserPath = puppeteer.executablePath();
    console.log('🧭 Chromium encontrado em:', browserPath);
    
    client = new Client({
        authStrategy: new LocalAuth({
            dataPath: '.wwebjs_auth'
        }),
        puppeteer: {
            headless: true,
            executablePath: browserPath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--single-process'
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
    
    client.on('disconnected', (reason) => {
        connectionStatus = 'disconnected';
        qrCodeString = null;
        console.log('❌ Desconectado:', reason);
        setTimeout(() => conectarWhatsApp(), 5000);
    });
    
    client.on('auth_failure', (msg) => {
        connectionStatus = 'auth_failure';
        console.log('❌ Falha autenticação:', msg);
        if (fs.existsSync('.wwebjs_auth')) {
            fs.rmSync('.wwebjs_auth', { recursive: true, force: true });
        }
        setTimeout(() => conectarWhatsApp(), 5000);
    });
    
    try {
        await client.initialize();
        console.log('🟢 Cliente inicializado');
    } catch (error) {
        console.error('Erro ao inicializar:', error.message);
        setTimeout(() => conectarWhatsApp(), 10000);
    }
}

async function enviarCodigoWhatsApp(numero, codigo) {
    if (!client || connectionStatus !== 'connected') {
        throw new Error('WhatsApp não está conectado');
    }
    
    try {
        const numeroLimpo = numero.replace(/\D/g, '');
        const numeroFormatado = '55' + numeroLimpo + '@c.us';
        
        const mensagem = `🔐 *CÓDIGO DE VERIFICAÇÃO*\n\n` +
                        `Seu código é: *${codigo}*\n\n` +
                        `⚠️ Não compartilhe com ninguém!\n` +
                        `⏰ Válido por 5 minutos`;
        
        await client.sendMessage(numeroFormatado, mensagem);
        console.log(`📱 Código ${codigo} enviado para ${numeroLimpo}`);
        return true;
        
    } catch (error) {
        console.error('Erro ao enviar:', error.message);
        throw new Error('Não foi possível enviar');
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
