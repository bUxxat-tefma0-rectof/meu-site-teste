// Simula banco de dados em memória
// No futuro pode trocar por MongoDB/PostgreSQL

const usuarios = [];
const codigosTemporarios = new Map();

function gerarCodigo() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function salvarCodigo(telefone, codigo) {
    // Expira em 5 minutos
    codigosTemporarios.set(telefone, {
        codigo,
        expiraEm: Date.now() + (5 * 60 * 1000)
    });
    
    // Remove após expirar
    setTimeout(() => {
        codigosTemporarios.delete(telefone);
    }, 5 * 60 * 1000);
    
    return codigo;
}

function verificarCodigo(telefone, codigo) {
    const dados = codigosTemporarios.get(telefone);
    
    if (!dados) {
        return { valido: false, mensagem: 'Código não encontrado ou expirado' };
    }
    
    if (Date.now() > dados.expiraEm) {
        codigosTemporarios.delete(telefone);
        return { valido: false, mensagem: 'Código expirado' };
    }
    
    if (dados.codigo !== codigo) {
        return { valido: false, mensagem: 'Código incorreto' };
    }
    
    // Remove código após uso
    codigosTemporarios.delete(telefone);
    return { valido: true, mensagem: 'Código válido' };
}

function cadastrarUsuario(nome, sobrenome, telefone) {
    const usuario = {
        id: usuarios.length + 1,
        nome,
        sobrenome,
        telefone,
        criadoEm: new Date().toISOString()
    };
    
    usuarios.push(usuario);
    return usuario;
}

function buscarUsuarioPorTelefone(telefone) {
    return usuarios.find(u => u.telefone === telefone);
}

module.exports = {
    gerarCodigo,
    salvarCodigo,
    verificarCodigo,
    cadastrarUsuario,
    buscarUsuarioPorTelefone
};
