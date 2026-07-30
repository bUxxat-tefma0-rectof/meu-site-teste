const venom = require('venom-bot');

let client = null;
let connectionStatus = 'disconnected';
let qrCodeString = null;

async function conectarWhatsApp() {
    try {
        client = await venom.create({
            session: 'whatsapp-session',
            multidevice: true,
            headless: true,
            useChrome: false,
            browserArgs: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ],
            catchQR: (base64Qr, asciiQR, attempts, urlCode) => {
                qrCodeString = urlCode || base64Qr;
                connectionStatus = 'waiting_qr';
                console.log('📱 QR Code gerado! Acesse /qr');
            },
            logQR: false
        });
        
        connectionStatus = 'connected';
        qrCodeString = null;
        console.log('✅ WhatsApp conectado!');
        
        client.onStateChange((state) => {
            console.log('Estado:', state);
            if (state === 'CONFLICT' || state === 'UNPAIRED') {
                connectionStatus = 'disconnected';
                qrCodeString = null;
                setTimeout(() => conectarWhatsApp(), 5000);
            }
        });
        
    } catch (error) {
        console.error('Erro:', error.message);
        connectionStatus = 'error';
        setTimeout(() => conectarWhatsApp(), 10000);
    }
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
    
    await client.sendText(numeroFormatado, mensagem);
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
