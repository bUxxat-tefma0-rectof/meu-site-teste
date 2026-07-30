const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const puppeteer = require('puppeteer');

let sock = null;
let connectionStatus = 'disconnected';
let qrCodeString = null;

async function conectarWhatsApp() {
    try {
        if (!fs.existsSync('auth_info_baileys')) {
            fs.mkdirSync('auth_info_baileys', { recursive: true });
        }
        
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            browser: ['Ubuntu', 'Chrome', '20.0.0'],
            markOnlineOnConnect: false,
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000
        });
        
        sock.ev.on('creds.update', saveCreds);
        
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                qrCodeString = qr;
                console.log('📱 QR Code gerado!');
            }
            
            if (connection === 'open') {
                connectionStatus = 'connected';
                qrCodeString = null;
                console.log('✅ WhatsApp conectado!');
            }
            
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error instanceof Boom 
                    ? lastDisconnect.error.output.statusCode 
                    : null;
                
                connectionStatus = 'disconnected';
                qrCodeString = null;
                
                if (statusCode === DisconnectReason.loggedOut) {
                    console.log('⚠️ Sessão expirada!');
                    fs.rmSync('auth_info_baileys', { recursive: true, force: true });
                    setTimeout(() => conectarWhatsApp(), 3000);
                } else {
                    console.log('❌ Reconectando em 5 segundos...');
                    setTimeout(() => conectarWhatsApp(), 5000);
                }
            }
        });
        
        return sock;
        
    } catch (error) {
        console.error('Erro:', error.message);
        connectionStatus = 'error';
        setTimeout(() => conectarWhatsApp(), 10000);
    }
}

async function enviarCodigoWhatsApp(numero, codigo) {
    if (!sock || connectionStatus !== 'connected') {
        throw new Error('WhatsApp não está conectado');
    }
    
    try {
        const numeroFormatado = numero.replace(/\D/g, '') + '@s.whatsapp.net';
        
        const mensagem = `🔐 *CÓDIGO DE VERIFICAÇÃO*\n\n` +
                        `Seu código é: *${codigo}*\n\n` +
                        `⚠️ Não compartilhe este código com ninguém!\n` +
                        `⏰ Válido por 5 minutos`;
        
        await sock.sendMessage(numeroFormatado, { text: mensagem });
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
