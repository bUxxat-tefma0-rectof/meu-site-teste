const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');

let sock = null;
let connectionStatus = 'disconnected';
let qrCodeString = null;

async function conectarWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'silent' })
        });
        
        sock.ev.on('creds.update', saveCreds);
        
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            // Salva QR Code para mostrar no navegador
            if (qr) {
                qrCodeString = qr;
                console.log('📱 QR Code gerado! Acesse /qr para escanear');
            }
            
            if (connection === 'open') {
                connectionStatus = 'connected';
                qrCodeString = null;
                console.log('✅ WhatsApp conectado!');
            }
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error instanceof Boom)
                    ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                    : true;
                
                connectionStatus = 'disconnected';
                console.log('❌ Conexão fechada. Reconectando...');
                
                if (shouldReconnect) {
                    setTimeout(() => conectarWhatsApp(), 5000);
                } else {
                    console.log('⚠️ Sessão expirada. Precisa escanear QR Code novamente.');
                    // Limpa sessão antiga
                    fs.rmSync('auth_info_baileys', { recursive: true, force: true });
                    setTimeout(() => conectarWhatsApp(), 3000);
                }
            }
        });
        
        return sock;
        
    } catch (error) {
        console.error('Erro ao conectar WhatsApp:', error);
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
        
        await sock.sendMessage(numeroFormatado, { 
            text: mensagem 
        });
        
        console.log(`📱 Código ${codigo} enviado para ${numero}`);
        return true;
        
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
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
