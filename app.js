// ============================================
// GERENCIADOR DE PERSONAGENS RPG - Frontend
// Aplicação Single Page Application (SPA) em JavaScript puro
// Integra com API Flask Backend + Fallback para localStorage
// ============================================

// ========== CONFIGURAÇÕES GERAIS ==========
// URLs e constantes para conexão com a API
const API_BASE_URL = 'http://127.0.0.1:5000';  // Endereço do servidor backend
const API_ENDPOINT = `${API_BASE_URL}/api/personagens`;  // Endpoint principal da API
const STORAGE_KEY = 'personagens_rpg';  // Chave para armazenar dados no localStorage
let useLocalStorage = false;  // Flag que controla se usa API ou localStorage

// ========== ELEMENTOS DO DOM ==========
// Referências para os elementos HTML da página
const formulario = document.getElementById('personagemForm');  // Formulário de criação
const nomeInput = document.getElementById('nome');  // Campo de nome
const classeInput = document.getElementById('classe');  // Campo de classe
const nivelInput = document.getElementById('nivel');  // Campo de nível
const tabelaCorpo = document.getElementById('personagensBody');  // Corpo da tabela
const mensagem = document.getElementById('mensagem-lista');  // Área de mensagens

// ============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================

// Event listener que executa quando a página carrega completamente
document.addEventListener('DOMContentLoaded', async () => {
    // Verifica conexão com API e depois carrega personagens
    await verificarConexaoAPI();
    await carregarPersonagens();
});

// Event listener para o formulário - previne reload da página no submit
formulario.addEventListener('submit', (e) => {
    e.preventDefault();  // Impede comportamento padrão do form
    criarPersonagem();   // Chama função de criação
});

/**
 * Verifica se a API backend está disponível e funcionando
 * Se não estiver, ativa o modo localStorage como fallback
 */
async function verificarConexaoAPI() {
    try {
        // Faz uma requisição de teste para o endpoint /api/hello
        const resposta = await fetch(`${API_BASE_URL}/api/hello`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (resposta.ok) {
            // API está funcionando - usa modo API
            useLocalStorage = false;
            console.log('✅ API conectada com sucesso em:', API_BASE_URL);
            mostrarMensagem('✅ Conectado ao servidor', 'sucesso-info');
            setTimeout(ocultarMensagem, 3000);  // Oculta mensagem após 3 segundos
            return true;
        }
    } catch (erro) {
        // Se der erro na conexão, ativa modo localStorage
        console.warn('⚠️ API não disponível, usando localStorage:', erro.message);
        useLocalStorage = true;
        mostrarMensagem('⚠️ Servidor não disponível - usando armazenamento local', 'aviso');
    }
    return false;
}

// ============================================
// OPERAÇÕES CRUD COM API / FALLBACK LOCALSTORAGE
// ============================================

/**
 * Carrega e exibe todos os personagens da API ou localStorage
 */
async function carregarPersonagens() {
    try {
        // Se estiver em modo localStorage, carrega do navegador
        if (useLocalStorage) {
            const personagens = obterPersonagensArmazenados();
            exibirPersonagens(personagens);
            return;
        }

        // Faz requisição GET para a API para obter todos os personagens
        const resposta = await fetch(API_ENDPOINT, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        // Se a resposta não for OK (200-299), lança erro
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

        // Converte resposta para JSON
        const dados = await resposta.json();

        if (dados.status === 'success') {
            // Exibe os personagens na tabela
            exibirPersonagens(dados.personagens);
            console.log(`✅ ${dados.personagens.length} personagem(ns) carregado(s) da API`);
        } else {
            mostrarMensagem('Erro ao carregar personagens', 'erro');
        }
    } catch (erro) {
        // Em caso de erro, volta para localStorage como fallback
        console.error('Erro ao carregar personagens:', erro);
        useLocalStorage = true;
        const personagens = obterPersonagensArmazenados();
        exibirPersonagens(personagens);
    }
}

/**
 * Renderiza a lista de personagens na tabela HTML
 */
function exibirPersonagens(personagens) {
    // Limpa o conteúdo atual da tabela
    tabelaCorpo.innerHTML = '';

    // Se não há personagens, mostra mensagem
    if (personagens.length === 0) {
        mostrarMensagem('Nenhum personagem cadastrado', 'vazio');
        return;
    }

    // Oculta mensagens anteriores
    ocultarMensagem();

    // Para cada personagem, cria uma linha na tabela
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
 * Cria um novo personagem via API ou localStorage
 */
async function criarPersonagem() {
    // Coleta dados do formulário
    const dados = {
        nome: nomeInput.value.trim(),
        classe: classeInput.value.trim(),
        nivel: parseInt(nivelInput.value) || 1
    };

    // Validações básicas dos campos
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

// ============================================
// SISTEMA DE TEMA CLARO/ESCURO
// ============================================

// Elemento do botão toggle
const themeToggle = document.getElementById('themeToggle');

// Carrega o tema salvo no localStorage ou usa 'light' como padrão
let currentTheme = localStorage.getItem('theme') || 'light';

// Aplica o tema atual ao carregar a página
document.documentElement.setAttribute('data-theme', currentTheme);

// Função para alternar entre temas
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';

    // Aplica o novo tema
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Salva a preferência no localStorage
    localStorage.setItem('theme', currentTheme);

    console.log(`Tema alterado para: ${currentTheme}`);
}

// Event listener para o botão toggle
themeToggle.addEventListener('click', toggleTheme);


