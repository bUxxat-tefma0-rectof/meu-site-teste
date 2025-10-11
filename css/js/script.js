// Tema
function toggleTheme() {
    const theme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    document.body.dataset.theme = theme;
}

// Login Admin
document.getElementById('admin-login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    // Senha estática inicial (substitua pela sua senha personalizada)
    if (password === 'SUA_SENHA_AQUI') {
        document.getElementById('login-section').classList.add('d-none');
        document.getElementById('admin-panel').classList.remove('d-none');
    } else {
        alert('Senha incorreta!');
    }
});

// Adicionar Produto (Placeholder)
document.getElementById('produto-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('produto-nome').value;
    const preco = document.getElementById('produto-preco').value;
    const descricao = document.getElementById('produto-descricao').value;
    const estoque = document.getElementById('produto-estoque').value;
    // Integração com backend via API (POST /produtos)
    console.log('Produto adicionado:', { nome, preco, descricao, estoque });
    alert('Produto adicionado com sucesso!');
});

// Recarga (Placeholder para QR Code)
document.getElementById('recarga-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const valor = document.getElementById('valor-recarga').value;
    if (valor < 2) {
        alert('Valor mínimo de recarga é R$2,00');
        return;
    }
    // Integração com API de Pix para gerar QR Code
    document.getElementById('qrcode').innerHTML = `<p>QR Code gerado para R$${valor} (Expira em 10 min)</p>`;
    setTimeout(() => location.reload(), 2000); // Simula recarga automática
});

// Gerar PDF (Placeholder)
function gerarPDF() {
    alert('Gerando PDF do histórico...');
    // Integração com biblioteca como jsPDF
}

// Modal de Compra (Placeholder)
function abrirModalCompra(nome, preco, estoque) {
    const saldo = 0; // Substituir por API
    document.getElementById('modal-descricao').innerHTML = `${nome} - R$${preco.toFixed(2)}<br>Descrição: Acesso premium, garantia de 30 dias.`;
    document.getElementById('modal-saldo').textContent = saldo.toFixed(2);
    document.getElementById('modal-estoque').textContent = estoque;
    const btnComprar = document.getElementById('btn-comprar');
    const saldoInsuficiente = document.getElementById('modal-saldo-insuficiente');
    if (saldo < preco) {
        saldoInsuficiente.classList.remove('d-none');
        document.getElementById('modal-falta').textContent = (preco - saldo).toFixed(2);
        btnComprar.disabled = true;
    } else {
        saldoInsuficiente.classList.add('d-none');
        btnComprar.disabled = false;
    }
    const modal = new bootstrap.Modal(document.getElementById('compraModal'));
    modal.show();
}
