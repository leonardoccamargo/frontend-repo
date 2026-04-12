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
const criarFichaCta = document.getElementById('criarFichaCta');
const voltarInicioBtn = document.getElementById('voltarInicioBtn');
let personagemAtivo = null;
const personagensCache = {};
const slotState = {};
const heroSection = document.querySelector('.hero-arcano');
const menuLinks = Array.from(document.querySelectorAll('.menu-link'));
const sectionViews = {
    home: [heroSection],
    personagens: [document.getElementById('secao-personagens-grid')],
    novaFicha: [document.getElementById('secao-personagens'), document.getElementById('secao-personagens-grid')],
    grimorio: [document.getElementById('secao-grimorio')],
    inventario: [document.getElementById('secao-inventario')],
    dados: [document.getElementById('secao-dados')]
};
const controlledSections = Object.values(sectionViews)
    .flat()
    .filter((section, index, sections) => section && sections.indexOf(section) === index);

// ============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================

function atualizarMenuAtivo(viewName) {
    const menuView = viewName === 'novaFicha' ? 'personagens' : viewName;
    menuLinks.forEach((link) => {
        const isActive = link.dataset.view === menuView;
        link.classList.toggle('is-active', isActive);

        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

function obterViewInicial() {
    const hashToView = {
        '#secao-personagens': 'personagens',
        '#secao-grimorio': 'grimorio',
        '#secao-inventario': 'inventario',
        '#secao-dados': 'dados'
    };

    return hashToView[window.location.hash] || 'home';
}

function alternarSecao(viewName, options = {}) {
    const nextView = sectionViews[viewName] ? viewName : 'home';
    const { focusTarget = null, updateHash = true } = options;

    controlledSections.forEach((section) => {
        const shouldShow = sectionViews[nextView].includes(section);
        section.hidden = !shouldShow;
    });

    if (voltarInicioBtn) {
        voltarInicioBtn.hidden = nextView === 'home';
    }

    atualizarMenuAtivo(nextView === 'home' ? '' : nextView);

    if (updateHash) {
        const nextUrl = nextView === 'home'
            ? `${window.location.pathname}${window.location.search}`
            : `${window.location.pathname}${window.location.search}${menuLinks.find((link) => link.dataset.view === nextView)?.getAttribute('href') || ''}`;

        history.replaceState(null, '', nextUrl);
    }

    if (focusTarget) {
        focusTarget.focus();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const initialView = obterViewInicial();

    alternarSecao(initialView, { updateHash: initialView !== 'home' });

    if (criarFichaCta) {
        criarFichaCta.addEventListener('click', () => {
            alternarSecao('novaFicha', { focusTarget: nomeInput });
        });
    }

    if (voltarInicioBtn) {
        voltarInicioBtn.addEventListener('click', () => {
            alternarSecao('home', { focusTarget: criarFichaCta });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const fecharPainelBtn = document.getElementById('fecharPainelBtn');
    if (fecharPainelBtn) {
        fecharPainelBtn.addEventListener('click', fecharPainel);
    }

    const painelPersonagem = document.getElementById('painelPersonagem');
    if (painelPersonagem) {
        painelPersonagem.addEventListener('click', (e) => {
            if (e.target.matches('.painel-backdrop')) {
                fecharPainel();
            } else if (e.target.matches('.btn-usar-slot')) {
                const nivel = parseInt(e.target.dataset.slot);
                if (personagemAtivo && slotState[personagemAtivo.id][nivel].atual > 0) {
                    slotState[personagemAtivo.id][nivel].atual--;
                    atualizarContadoresSlots();
                }
            } else if (e.target.matches('.btn-recuperar-slot')) {
                const nivel = parseInt(e.target.dataset.slot);
                if (personagemAtivo) {
                    slotState[personagemAtivo.id][nivel].atual = slotState[personagemAtivo.id][nivel].max;
                    atualizarContadoresSlots();
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !painelPersonagem.hidden) {
                fecharPainel();
            }
        });
    }

    menuLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            alternarSecao(link.dataset.view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Event listeners para botões de dados
    const diceButtons = Array.from(document.querySelectorAll('[data-dice]'));
    const diceResultNumber = document.getElementById('diceResultNumber');
    
    diceButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const dado = button.dataset.dice;
            const lados = parseInt(dado.replace('d', ''), 10);
            const valor = rolarDado(lados);
            
            if (diceResultNumber) {
                diceResultNumber.textContent = valor;
            }
        });
    });

    // Event listeners para busca e filtro
    const btnBuscarNome = document.getElementById('btnBuscarNome');
    const btnFiltrarClasse = document.getElementById('btnFiltrarClasse');
    const btnCarregarTodos = document.getElementById('btnCarregarTodos');
    const searchNome = document.getElementById('searchNome');
    const filterClasse = document.getElementById('filterClasse');

    if (btnBuscarNome) {
        btnBuscarNome.addEventListener('click', buscarPorNome);
    }
    if (btnFiltrarClasse) {
        btnFiltrarClasse.addEventListener('click', filtrarPorClasse);
    }
    if (btnCarregarTodos) {
        btnCarregarTodos.addEventListener('click', () => {
            if (searchNome) {
                searchNome.value = '';
            }
            if (filterClasse) {
                filterClasse.value = '';
            }
            carregarPersonagens();
        });
    }

    // Permitir busca com Enter
    if (searchNome) {
        searchNome.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') buscarPorNome();
        });
    }

    // Permitir filtro com Enter
    if (filterClasse) {
        filterClasse.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') filtrarPorClasse();
        });
    }

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
    // Mostra indicador de loading
    mostrarLoading();

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

        if (resposta.status === 404) {
            exibirPersonagens([]);
            return;
        }

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
    } finally {
        // Remove indicador de loading
        ocultarLoading();
    }
}

/**
 * Renderiza a lista de personagens na tabela HTML
 */
function exibirPersonagens(personagens) {
    // Limpa o conteúdo atual da grade de cards
    tabelaCorpo.innerHTML = '';

    // Se não há personagens, mostra mensagem
    if (personagens.length === 0) {
        mostrarMensagem('Nenhum personagem cadastrado', 'vazio');
        return;
    }

    // Oculta mensagens anteriores
    ocultarMensagem();
    personagens.forEach(p => { personagensCache[p.id] = p; });

    // Para cada personagem, cria um card com animação de entrada
    personagens.forEach((personagem, index) => {
        const linha = document.createElement('article');
        linha.classList.add('character-card', 'personagem-card');
        const hp = 10 + personagem.nivel * 5;
        const mana = 6 + personagem.nivel * 3;
        const ca = 10 + Math.floor(personagem.nivel / 2);

        linha.innerHTML = `
            <div class="personagem-topo">
                <h3 class="personagem-nome">${personagem.nome}</h3>
                <span class="personagem-id">ID ${personagem.id}</span>
            </div>
            <p class="personagem-info">Classe: ${personagem.classe} | Nível: ${personagem.nivel}</p>
            <div class="status-rapido">
                <div><span>HP</span><strong>${hp}</strong></div>
                <div><span>Mana</span><strong>${mana}</strong></div>
                <div><span>CA</span><strong>${ca}</strong></div>
            </div>
            <div class="personagem-acoes">
                <button class="btn-editar btn-detalhes" type="button" onclick="selecionarPersonagem(${personagem.id})">Selecionar Personagem</button>
                <button class="btn-editar" type="button" onclick="abrirEditarPersonagem(${personagem.id})">Editar</button>
                <button class="btn-deletar" onclick="deletarPersonagem(${personagem.id})">Deletar</button>
            </div>
        `;

        // Adiciona animação de entrada com atraso progressivo
        linha.style.animationDelay = `${index * 0.1}s`;

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

    // Validação adicional: verifica se o nome mudou e se já existe
    if (novoNome.trim() !== personagem.nome) {
        try {
            // Busca todos os personagens para verificar duplicatas
            const resposta = await fetch(API_ENDPOINT, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (resposta.ok) {
                const dados = await resposta.json();
                if (dados.status === 'success') {
                    const nomeExiste = dados.personagens.some(p =>
                        p.nome.toLowerCase() === novoNome.trim().toLowerCase() && p.id !== personagem.id
                    );

                    if (nomeExiste) {
                        mostrarMensagem('Já existe um personagem com este nome', 'erro');
                        return;
                    }
                }
            }
        } catch (erro) {
            console.warn('Não foi possível verificar duplicatas, prosseguindo...', erro);
        }
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

// Carrega o tema salvo no localStorage ou usa 'dark' como padrão
let currentTheme = localStorage.getItem('theme') || 'dark';

// Atualiza o texto e os atributos do botão conforme o tema ativo.
function atualizarRotuloTema(theme) {
    if (!themeToggle) {
        return;
    }

    const label = theme === 'light' ? 'Alterar para escuro' : 'Alterar para claro';
    themeToggle.textContent = label;
    themeToggle.title = `Tema ${label.toLowerCase()} ativo`;
    themeToggle.setAttribute('aria-label', `Tema ${label.toLowerCase()} ativo`);
}

// Aplica o tema atual ao carregar a página
document.documentElement.setAttribute('data-theme', currentTheme);
atualizarRotuloTema(currentTheme);

// Função para alternar entre temas
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // Aplica o novo tema
    document.documentElement.setAttribute('data-theme', currentTheme);
    atualizarRotuloTema(currentTheme);

    // Salva a preferência no localStorage
    localStorage.setItem('theme', currentTheme);

    console.log(`Tema alterado para: ${currentTheme}`);
}

// Event listener para o botão toggle
themeToggle.addEventListener('click', toggleTheme);

// ============================================
// FUNÇÕES DE BUSCA E FILTRO
// ============================================

/**
 * Busca personagens por nome usando filtro na rota /api/personagens
 */
async function buscarPorNome() {
    const searchNome = document.getElementById('searchNome');
    const termo = searchNome.value.trim();

    if (!termo) {
        mostrarMensagem('Por favor, digite um nome para buscar', 'aviso');
        return;
    }

    mostrarLoading();

    try {
        if (useLocalStorage) {
            // Fallback: busca no localStorage
            const personagens = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const resultados = personagens.filter(p => 
                p.nome.toLowerCase().includes(termo.toLowerCase())
            );
            
            if (resultados.length === 0) {
                mostrarMensagem(`Nenhum personagem encontrado com o nome "${termo}"`, 'info');
                tabelaCorpo.innerHTML = '';
            } else {
                mostrarMensagem(`${resultados.length} personagem(s) encontrado(s)`, 'sucesso-info');
                exibirPersonagens(resultados);
            }
        } else {
            // Busca via API
            const resposta = await fetch(`${API_ENDPOINT}?nome=${encodeURIComponent(termo)}`);

            if (resposta.status === 404) {
                mostrarMensagem(`Nenhum personagem encontrado com o nome "${termo}"`, 'info');
                tabelaCorpo.innerHTML = '';
                return;
            }

            if (!resposta.ok) {
                throw new Error(`Erro na busca: ${resposta.status}`);
            }

            const dados = await resposta.json();

            if (dados.personagens && dados.personagens.length > 0) {
                mostrarMensagem(`${dados.total} personagem(s) encontrado(s) com "${termo}"`, 'sucesso-info');
                exibirPersonagens(dados.personagens);
            } else {
                mostrarMensagem(`Nenhum personagem encontrado com o nome "${termo}"`, 'info');
                tabelaCorpo.innerHTML = '';
            }
        }
    } catch (erro) {
        console.error('Erro ao buscar personagens:', erro);
        mostrarMensagem('Erro ao buscar personagens', 'erro');
    }
}

/**
 * Filtra personagens por classe usando filtro na rota /api/personagens
 */
async function filtrarPorClasse() {
    const filterClasse = document.getElementById('filterClasse');
    const classe = filterClasse.value.trim();

    if (!classe) {
        mostrarMensagem('Por favor, digite uma classe para filtrar', 'aviso');
        return;
    }

    mostrarLoading();

    try {
        if (useLocalStorage) {
            // Fallback: filtra no localStorage
            const personagens = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const resultados = personagens.filter(p => 
                p.classe.toLowerCase().includes(classe.toLowerCase())
            );
            
            if (resultados.length === 0) {
                mostrarMensagem(`Nenhum personagem da classe "${classe}" encontrado`, 'info');
                tabelaCorpo.innerHTML = '';
            } else {
                mostrarMensagem(`${resultados.length} personagem(s) da classe "${classe}"`, 'sucesso-info');
                exibirPersonagens(resultados);
            }
        } else {
            // Filtra via API
            const resposta = await fetch(`${API_ENDPOINT}?classe=${encodeURIComponent(classe)}`);

            if (resposta.status === 404) {
                mostrarMensagem(`Nenhum personagem da classe "${classe}" encontrado`, 'info');
                tabelaCorpo.innerHTML = '';
                return;
            }

            if (!resposta.ok) {
                throw new Error(`Erro no filtro: ${resposta.status}`);
            }

            const dados = await resposta.json();

            if (dados.personagens && dados.personagens.length > 0) {
                mostrarMensagem(`${dados.total} personagem(s) da classe "${classe}"`, 'sucesso-info');
                exibirPersonagens(dados.personagens);
            } else {
                mostrarMensagem(`Nenhum personagem da classe "${classe}" encontrado`, 'info');
                tabelaCorpo.innerHTML = '';
            }
        }
    } catch (erro) {
        console.error('Erro ao filtrar personagens:', erro);
        mostrarMensagem('Erro ao filtrar personagens', 'erro');
    }
}

// ============================================
// FUNÇÕES DE LOADING E ANIMAÇÕES
// ============================================

/**
 * Mostra indicador de loading na tabela
 */
function mostrarLoading() {
    tabelaCorpo.innerHTML = `
        <div class="loading-wrap loading-row">
            <div style="text-align: center; padding: 24px;">
                <div class="loading-spinner"></div>
                <p style="margin-top: 10px; color: var(--texto-secundario);">Carregando personagens...</p>
            </div>
        </div>
    `;
}

/**
 * Remove indicador de loading
 */
function ocultarLoading() {
    const loadingRow = document.querySelector('.loading-row');
    if (loadingRow) {
        loadingRow.remove();
    }
}

// ============================================
// PAINEL LATERAL DE PERSONAGEM
// ============================================

function calcularSlotsIniciais(nivel) {
    return {
        1: { max: Math.min(4, Math.max(2, nivel)), atual: Math.min(4, Math.max(2, nivel)) },
        2: { max: nivel >= 3 ? Math.min(3, nivel - 1) : 0, atual: nivel >= 3 ? Math.min(3, nivel - 1) : 0 },
        3: { max: nivel >= 5 ? Math.min(3, nivel - 3) : 0, atual: nivel >= 5 ? Math.min(3, nivel - 3) : 0 }
    };
}

function atualizarContadoresSlots() {
    if (!personagemAtivo) return;
    const slots = slotState[personagemAtivo.id];
    [1, 2, 3].forEach((nivel) => {
        const contador = document.getElementById(`slotContador${nivel}`);
        const linha = document.querySelector(`.slot-linha[data-slot-nivel="${nivel}"]`);
        if (contador) contador.textContent = `${slots[nivel].atual}/${slots[nivel].max}`;
        if (linha) linha.hidden = slots[nivel].max === 0;
    });
}

function selecionarPersonagem(id) {
    personagemAtivo = personagensCache[id] || null;
    if (!personagemAtivo) return;

    if (!slotState[id]) {
        slotState[id] = calcularSlotsIniciais(personagemAtivo.nivel);
    }

    const hp = 10 + personagemAtivo.nivel * 5;
    const mana = 6 + personagemAtivo.nivel * 3;
    const ca = 10 + Math.floor(personagemAtivo.nivel / 2);

    document.querySelector('.painel-nome').textContent = personagemAtivo.nome;
    document.querySelector('.painel-info-char').textContent = `${personagemAtivo.classe} • Nível ${personagemAtivo.nivel}`;
    document.querySelector('.painel-hp').textContent = hp;
    document.querySelector('.painel-mana').textContent = mana;
    document.querySelector('.painel-ca').textContent = ca;

    atualizarContadoresSlots();

    const painel = document.getElementById('painelPersonagem');
    painel.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('fecharPainelBtn').focus();
}

function fecharPainel() {
    document.getElementById('painelPersonagem').hidden = true;
    document.body.style.overflow = '';
    personagemAtivo = null;
}

function rolarDado(lados) {
    return Math.floor(Math.random() * lados) + 1;
}


