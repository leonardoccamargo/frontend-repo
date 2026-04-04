// ============================================
// GERENCIADOR DE PERSONAGENS - versão com API
// Integração com Flask Backend + Fallback localStorage
// ============================================

// Configuração da API
const API_BASE_URL = 'http://127.0.0.1:5000';
const API_ENDPOINT = `${API_BASE_URL}/api/personagens`;
const STORAGE_KEY = 'personagens_rpg';
let useLocalStorage = false; // Flag para usar localStorage se API não disponível

// Elementos do DOM
const formulario = document.getElementById('personagemForm');
const nomeInput = document.getElementById('nome');
const classeInput = document.getElementById('classe');
const nivelInput = document.getElementById('nivel');
const tabelaCorpo = document.getElementById('personagensBody');
const mensagem = document.getElementById('mensagem-lista');

// ============================================
// INICIALIZAÇÃO E CONFIGURAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    await verificarConexaoAPI();
    await carregarPersonagens();
});

formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    criarPersonagem();
});

/**
 * Verifica se a API está disponível
 */
async function verificarConexaoAPI() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/api/hello`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (resposta.ok) {
            useLocalStorage = false;
            console.log('✅ API conectada com sucesso em:', API_BASE_URL);
            mostrarMensagem('✅ Conectado ao servidor', 'sucesso-info');
            setTimeout(ocultarMensagem, 3000);
            return true;
        }
    } catch (erro) {
        console.warn('⚠️ API não disponível, usando localStorage:', erro.message);
        useLocalStorage = true;
        mostrarMensagem('⚠️ Servidor não disponível - usando armazenamento local', 'aviso');
    }
    return false;
}

// ============================================
// OPERAÇÕES COM API / FALLBACK LOCALSTORAGE
// ============================================

/**
 * Carrega todos os personagens
 */
async function carregarPersonagens() {
    try {
        if (useLocalStorage) {
            const personagens = obterPersonagensArmazenados();
            exibirPersonagens(personagens);
            return;
        }

        // Chamada à rota GET /api/personagens
        const resposta = await fetch(API_ENDPOINT, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

        const dados = await resposta.json();
        
        if (dados.status === 'success') {
            exibirPersonagens(dados.personagens);
            console.log(`✅ ${dados.personagens.length} personagem(ns) carregado(s) da API`);
        } else {
            mostrarMensagem('Erro ao carregar personagens', 'erro');
        }
    } catch (erro) {
        console.error('Erro ao carregar personagens:', erro);
        useLocalStorage = true;
        const personagens = obterPersonagensArmazenados();
        exibirPersonagens(personagens);
    }
}

/**
 * Exibe personagens na tabela
 */
function exibirPersonagens(personagens) {
    tabelaCorpo.innerHTML = '';

    if (personagens.length === 0) {
        mostrarMensagem('Nenhum personagem cadastrado', 'vazio');
        return;
    }

    ocultarMensagem();
    
    personagens.forEach((personagem) => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${personagem.id}</td>
            <td>${personagem.nome}</td>
            <td>${personagem.classe}</td>
            <td>${personagem.nivel}</td>
            <td>
                <button class="btn-editar" onclick="abrirEditarPersonagem(${personagem.id})">Editar</button>
                <button class="btn-deletar" onclick="deletarPersonagem(${personagem.id})">Deletar</button>
            </td>
        `;
        tabelaCorpo.appendChild(linha);
    });
}

/**
 * Cria um novo personagem
 */
async function criarPersonagem() {
    const dados = {
        nome: nomeInput.value.trim(),
        classe: classeInput.value.trim(),
        nivel: parseInt(nivelInput.value) || 1
    };

    // Validações
    if (!dados.nome) {
        mostrarMensagem('Por favor, insira um nome', 'erro');
        nomeInput.focus();
        return;
    }

    if (!dados.classe) {
        mostrarMensagem('Por favor, insira uma classe', 'erro');
        classeInput.focus();
        return;
    }

    try {
        if (useLocalStorage) {
            criarPersonagemLocal(dados);
            return;
        }

        // Chamada à rota POST /api/personagens
        const resposta = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (resposta.ok && resultado.status === 'success') {
            mostrarMensagem(resultado.message || 'Personagem criado com sucesso', 'sucesso');
            formulario.reset();
            nivelInput.value = 1;
            await carregarPersonagens();
        } else {
            mostrarMensagem(resultado.message || 'Erro ao criar personagem', 'erro');
        }
    } catch (erro) {
        console.error('Erro ao criar personagem:', erro);
        useLocalStorage = true;
        criarPersonagemLocal(dados);
    }
}

/**
 * Deleta um personagem
 */
async function deletarPersonagem(id) {
    if (!confirm('Tem certeza que deseja deletar este personagem?')) {
        return;
    }

    try {
        if (useLocalStorage) {
            deletarPersonagemLocal(id);
            return;
        }

        // Chamada à rota DELETE /api/personagens/<id>
        const resposta = await fetch(`${API_ENDPOINT}/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const resultado = await resposta.json();

        if (resposta.ok && resultado.status === 'success') {
            mostrarMensagem(resultado.message || 'Personagem deletado com sucesso', 'sucesso');
            await carregarPersonagens();
        } else {
            mostrarMensagem(resultado.message || 'Erro ao deletar personagem', 'erro');
        }
    } catch (erro) {
        console.error('Erro ao deletar personagem:', erro);
        useLocalStorage = true;
        deletarPersonagemLocal(id);
    }
}

/**
 * Abre dialog para editar personagem
 */
async function abrirEditarPersonagem(id) {
    if (useLocalStorage) {
        editarPersonagemLocal(id);
        return;
    }

    // Primeiro, obtém o personagem atual da API
    try {
        const resposta = await fetch(`${API_ENDPOINT}/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

        const dados = await resposta.json();
        
        if (dados.status === 'success') {
            const personagem = dados.personagem;
            editarPersonagemAPI(personagem);
        }
    } catch (erro) {
        console.error('Erro ao buscar personagem:', erro);
        mostrarMensagem('Erro ao buscar dados do personagem', 'erro');
    }
}

/**
 * Edita personagem via API
 */
async function editarPersonagemAPI(personagem) {
    const novoNome = prompt('Novo nome:', personagem.nome);
    if (novoNome === null) return;

    if (!novoNome.trim()) {
        mostrarMensagem('Nome não pode estar vazio', 'erro');
        return;
    }

    const novaClasse = prompt('Nova classe:', personagem.classe);
    if (novaClasse === null) return;

    if (!novaClasse.trim()) {
        mostrarMensagem('Classe não pode estar vazia', 'erro');
        return;
    }

    const novoNivel = prompt('Novo nível:', personagem.nivel);
    if (novoNivel === null) return;

    const nivelNum = parseInt(novoNivel);
    if (isNaN(nivelNum) || nivelNum < 1) {
        mostrarMensagem('Nível deve ser um número maior que 0', 'erro');
        return;
    }

    const dadosAtualizados = {
        nome: novoNome.trim(),
        classe: novaClasse.trim(),
        nivel: nivelNum
    };

    try {
        // Chamada à rota PUT /api/personagens/<id>
        const resposta = await fetch(`${API_ENDPOINT}/${personagem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados)
        });

        const resultado = await resposta.json();

        if (resposta.ok && resultado.status === 'success') {
            mostrarMensagem(resultado.message || 'Personagem atualizado com sucesso', 'sucesso');
            await carregarPersonagens();
        } else {
            mostrarMensagem(resultado.message || 'Erro ao atualizar personagem', 'erro');
        }
    } catch (erro) {
        console.error('Erro ao atualizar personagem:', erro);
        mostrarMensagem('Erro ao conectar com o servidor', 'erro');
    }
}

// ============================================
// FUNÇÕES DE FALLBACK (LOCALSTORAGE)
// ============================================

function obterPersonagensArmazenados() {
    try {
        const dados = localStorage.getItem(STORAGE_KEY);
        return dados ? JSON.parse(dados) : [];
    } catch (erro) {
        console.error('Erro ao ler localStorage:', erro);
        return [];
    }
}

function salvarPersonagensArmazenados(personagens) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(personagens));
        return true;
    } catch (erro) {
        console.error('Erro ao salvar no localStorage:', erro);
        mostrarMensagem('Erro ao salvar dados no navegador', 'erro');
        return false;
    }
}

function gerarProximoId() {
    const personagens = obterPersonagensArmazenados();
    if (personagens.length === 0) return 1;
    return Math.max(...personagens.map(p => p.id)) + 1;
}

function criarPersonagemLocal(dados) {
    const personagens = obterPersonagensArmazenados();
    
    if (personagens.some(p => p.nome.toLowerCase() === dados.nome.toLowerCase())) {
        mostrarMensagem('Já existe um personagem com este nome', 'erro');
        return;
    }

    const novoPersonagem = {
        id: gerarProximoId(),
        ...dados
    };

    personagens.push(novoPersonagem);
    
    if (salvarPersonagensArmazenados(personagens)) {
        mostrarMensagem('Personagem criado com sucesso (local)', 'sucesso');
        formulario.reset();
        nivelInput.value = 1;
        carregarPersonagens();
    }
}

function deletarPersonagemLocal(id) {
    const personagens = obterPersonagensArmazenados();
    const index = personagens.findIndex(p => p.id === id);

    if (index === -1) {
        mostrarMensagem('Personagem não encontrado', 'erro');
        return;
    }

    const nomePersonagem = personagens[index].nome;
    personagens.splice(index, 1);

    if (salvarPersonagensArmazenados(personagens)) {
        mostrarMensagem(`Personagem "${nomePersonagem}" deletado com sucesso (local)`, 'sucesso');
        carregarPersonagens();
    }
}

function editarPersonagemLocal(id) {
    const personagens = obterPersonagensArmazenados();
    const personagem = personagens.find(p => p.id === id);

    if (!personagem) {
        mostrarMensagem('Personagem não encontrado', 'erro');
        return;
    }

    const novoNome = prompt('Novo nome:', personagem.nome);
    if (novoNome === null) return;

    if (!novoNome.trim()) {
        mostrarMensagem('Nome não pode estar vazio', 'erro');
        return;
    }

    if (novoNome !== personagem.nome && 
        personagens.some(p => p.nome.toLowerCase() === novoNome.toLowerCase())) {
        mostrarMensagem('Já existe outro personagem com este nome', 'erro');
        return;
    }

    const novaClasse = prompt('Nova classe:', personagem.classe);
    if (novaClasse === null) return;

    if (!novaClasse.trim()) {
        mostrarMensagem('Classe não pode estar vazia', 'erro');
        return;
    }

    const novoNivel = prompt('Novo nível:', personagem.nivel);
    if (novoNivel === null) return;

    const nivelNum = parseInt(novoNivel);
    if (isNaN(nivelNum) || nivelNum < 1) {
        mostrarMensagem('Nível deve ser um número maior que 0', 'erro');
        return;
    }

    personagem.nome = novoNome.trim();
    personagem.classe = novaClasse.trim();
    personagem.nivel = nivelNum;

    if (salvarPersonagensArmazenados(personagens)) {
        mostrarMensagem(`Personagem "${personagem.nome}" atualizado com sucesso (local)`, 'sucesso');
        carregarPersonagens();
    }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Mostra mensagem na tela
 */
function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = `mensagem-${tipo}`;
}

/**
 * Oculta mensagem
 */
function ocultarMensagem() {
    mensagem.textContent = '';
    mensagem.className = '';
}


