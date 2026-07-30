const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');

let sock = null;
let connectionStatus = 'disconnected';

async function conectarWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: pino({ level: 'silent' })
        });
        
        sock.ev.on('creds.update', saveCreds);
        
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'open') {
                connectionStatus = 'connected';
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
        // Formata o número para o padrão do WhatsApp
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

module.exports = {
    conectarWhatsApp,
    enviarCodigoWhatsApp,
    getStatus
};
