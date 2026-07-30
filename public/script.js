const API_URL = window.location.origin;

let dadosCadastro = {};

function formatarTelefone(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.slice(0, 11);
    
    if (valor.length > 0) {
        valor = '(' + valor;
        if (valor.length > 3) {
            valor = valor.slice(0, 3) + ') ' + valor.slice(3);
        }
        if (valor.length > 10) {
            valor = valor.slice(0, 10) + '-' + valor.slice(10);
        }
    }
    
    input.value = valor;
}

// Adiciona formatação ao campo telefone
document.getElementById('telefone').addEventListener('input', function(e) {
    formatarTelefone(e.target);
});

function mostrarMensagem(texto, tipo) {
    const msg = document.getElementById('mensagem');
    msg.textContent = texto;
    msg.className = 'mensagem ' + tipo;
    msg.style.display = 'block';
    
    setTimeout(() => {
        msg.style.display = 'none';
    }, 5000);
}

function mostrarLoading(texto) {
    document.getElementById('loading-text').textContent = texto;
    document.getElementById('loading').style.display = 'block';
}

function esconderLoading() {
    document.getElementById('loading').style.display = 'none';
}

async function enviarCodigo() {
    const nome = document.getElementById('nome').value.trim();
    const sobrenome = document.getElementById('sobrenome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    
    // Validações
    if (!nome || nome.length < 2) {
        return mostrarMensagem('Nome é obrigatório (mínimo 2 caracteres)', 'erro');
    }
    
    if (!sobrenome || sobrenome.length < 2) {
        return mostrarMensagem('Sobrenome é obrigatório (mínimo 2 caracteres)', 'erro');
    }
    
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        return mostrarMensagem('Telefone inválido', 'erro');
    }
    
    // Salva dados
    dadosCadastro = { nome, sobrenome, telefone: telefoneLimpo };
    
    // Desabilita botão
    const btn = document.getElementById('btn-enviar');
    btn.disabled = true;
    btn.textContent = 'Enviando...';
    
    mostrarLoading('Enviando código via WhatsApp...');
    
    try {
        const response = await fetch(`${API_URL}/api/enviar-codigo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, sobrenome, telefone: telefoneLimpo })
        });
        
        const data = await response.json();
        
        esconderLoading();
        btn.disabled = false;
        btn.textContent = '📨 Enviar Código';
        
        if (data.sucesso) {
            // Mostra etapa 2
            document.getElementById('etapa1').style.display = 'none';
            document.getElementById('etapa2').style.display = 'block';
            document.getElementById('telefone-exibido').textContent = 
                telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            
            mostrarMensagem('✅ Código enviado! Verifique seu WhatsApp.', 'sucesso');
        } else {
            mostrarMensagem(data.mensagem, 'erro');
        }
        
    } catch (error) {
        esconderLoading();
        btn.disabled = false;
        btn.textContent = '📨 Enviar Código';
        mostrarMensagem('Erro ao conectar. Tente novamente.', 'erro');
    }
}

async function verificarCodigo() {
    const codigo = document.getElementById('codigo').value.trim();
    
    if (codigo.length !== 6 || !/^\d{6}$/.test(codigo)) {
        return mostrarMensagem('Digite o código de 6 dígitos', 'erro');
    }
    
    const btn = document.getElementById('btn-verificar');
    btn.disabled = true;
    btn.textContent = 'Verificando...';
    
    mostrarLoading('Verificando código...');
    
    try {
        const response = await fetch(`${API_URL}/api/verificar-codigo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...dadosCadastro,
                codigo
            })
        });
        
        const data = await response.json();
        
        esconderLoading();
        btn.disabled = false;
        btn.textContent = '✅ Verificar Código';
        
        if (data.sucesso) {
            // Sucesso!
            document.getElementById('etapa2').style.display = 'none';
            document.getElementById('etapa3').style.display = 'block';
            document.getElementById('nome-usuario').textContent = 
                `${data.usuario.nome} ${data.usuario.sobrenome}`;
        } else {
            mostrarMensagem(data.mensagem, 'erro');
        }
        
    } catch (error) {
        esconderLoading();
        btn.disabled = false;
        btn.textContent = '✅ Verificar Código';
        mostrarMensagem('Erro ao verificar. Tente novamente.', 'erro');
    }
}

function voltar() {
    document.getElementById('etapa2').style.display = 'none';
    document.getElementById('etapa1').style.display = 'block';
    document.getElementById('codigo').value = '';
    document.getElementById('mensagem').style.display = 'none';
}
