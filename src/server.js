// Rota para ver QR Code (pequeno e centralizado)
app.get('/qr', (req, res) => {
    const qr = getQR();
    const status = getStatus();
    
    // WhatsApp já conectado
    if (status === 'connected') {
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        background: #f0f2f5;
                    }
                    .box {
                        background: white;
                        padding: 40px;
                        border-radius: 20px;
                        text-align: center;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    }
                    .emoji { font-size: 60px; }
                    h2 { color: #25D366; margin: 15px 0; }
                    p { color: #666; }
                </style>
            </head>
            <body>
                <div class="box">
                    <div class="emoji">✅</div>
                    <h2>WhatsApp Conectado!</h2>
                    <p>Pronto para enviar códigos</p>
                    <script>setTimeout(() => location.reload(), 10000);</script>
                </div>
            </body>
            </html>
        `);
    }
    
    // Aguardando QR Code
    if (!qr) {
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        background: #f0f2f5;
                    }
                    .box {
                        background: white;
                        padding: 40px;
                        border-radius: 20px;
                        text-align: center;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    }
                    .loader {
                        width: 50px;
                        height: 50px;
                        border: 5px solid #f3f3f3;
                        border-top: 5px solid #25D366;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 20px auto;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    h2 { color: #333; }
                    p { color: #999; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="box">
                    <h2>⏳ Gerando QR Code...</h2>
                    <div class="loader"></div>
                    <p>Aguarde um momento</p>
                    <script>setTimeout(() => location.reload(), 5000);</script>
                </div>
            </body>
            </html>
        `);
    }
    
    // Mostra QR Code usando API do Google (sempre funciona)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qr)}`;
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: #f0f2f5;
                    padding: 20px;
                }
                .box {
                    background: white;
                    padding: 30px;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    max-width: 400px;
                }
                h2 { color: #25D366; margin-bottom: 5px; font-size: 22px; }
                .sub { color: #666; margin-bottom: 20px; font-size: 14px; }
                .qrcode-img {
                    width: 250px;
                    height: 250px;
                    border: 3px solid #25D366;
                    border-radius: 15px;
                    padding: 10px;
                }
                .instrucoes {
                    background: #fff9e6;
                    padding: 15px;
                    border-radius: 10px;
                    margin-top: 20px;
                    text-align: left;
                    font-size: 13px;
                }
                .instrucoes strong { color: #856404; }
                .instrucoes ol { margin: 8px 0 0 20px; color: #856404; }
                .instrucoes li { margin: 5px 0; }
                .timer { color: #999; font-size: 12px; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>📱 WhatsApp</h2>
                <p class="sub">Escaneie o QR Code</p>
                <img src="${qrUrl}" alt="QR Code" class="qrcode-img">
                <div class="instrucoes">
                    <strong>📋 Como escanear:</strong>
                    <ol>
                        <li>Abra o WhatsApp no celular</li>
                        <li>Aparelhos Conectados</li>
                        <li>Escanear QR Code</li>
                    </ol>
                </div>
                <p class="timer">Atualiza em 15 segundos</p>
                <script>setTimeout(() => location.reload(), 15000);</script>
            </div>
        </body>
        </html>
    `);
});
