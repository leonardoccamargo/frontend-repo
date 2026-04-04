# 🎮 Frontend - Gerenciador de Personagens RPG

Uma **Single Page Application (SPA)** moderna e responsiva para gerenciar personagens de RPG, desenvolvida com **HTML, CSS e JavaScript puro** (sem frameworks como React, Vue ou Angular).

Este repositório contém apenas o frontend da aplicação. Para o backend API, veja [backend-repo](https://github.com/leonardoccamargo/backend-repo).

---

## 📋 Características

- ✅ **100% Vanilla JavaScript** - Sem dependências de frameworks SPA
- ✅ **Integração com API** - Conecta com o backend Flask
- ✅ **Fallback para LocalStorage** - Funciona offline se API não estiver disponível
- ✅ **Design Responsivo** - Funciona em desktop, tablet e mobile
- ✅ **SPA (Single Page Application)** - Sem recarregar a página
- ✅ **Validação em Tempo Real** - Feedback instantâneo ao usuário
- ✅ **Interface Intuitiva** - Fácil de usar e navegável

---

## 🗂️ Estrutura do Projeto

```
frontend-repo/
├── index.html              # Página HTML principal
├── app.js                  # Lógica JavaScript (CRUD completo)
├── style.css               # Estilos CSS responsivos
└── README.md               # Este arquivo
```

---

## 🚀 Instalação e Uso

### **Pré-requisitos**
- Navegador web moderno
- Backend API rodando (opcional, mas recomendado)

### **Passo 1: Clonar o Repositório**

```bash
git clone https://github.com/leonardoccamargo/frontend-repo.git
cd frontend-repo
```

### **Opção 1: Executar com Backend (Recomendado)**

1. **Certifique-se que o Backend está rodando:**
   ```bash
   # Em outro terminal, clone e rode o backend
   git clone https://github.com/leonardoccamargo/backend-repo.git
   cd backend-repo
   python main.py
   # Deve aparecer: Running on http://127.0.0.1:5000
   ```

2. **Abra o Frontend:**
   - **Arquivo local:** Duplo clique em `index.html`
   - **OU servidor local:** Use Python ou Node.js (veja Opção 2)

### **Opção 2: Servidor HTTP Simples (Sem Backend)**

Se quiser apenas testar a interface (usará LocalStorage):

#### **Python:**
```bash
python -m http.server 8000
# Acesse: http://localhost:8000
```

#### **Node.js (http-server):**
```bash
npm install -g http-server
http-server
```

---

## 🎯 Como Usar a Aplicação

### **1. Adicionar Personagem**
1. Preencha os campos:
   - **Nome do Personagem:** Nome único
   - **Classe:** Guerreiro, Mago, Arqueiro, etc.
   - **Nível:** Número entre 1-99
2. Clique em **"Adicionar Personagem"**
3. O personagem aparecerá na tabela abaixo

### **2. Visualizar Personagens**
- Todos os personagens aparecem em uma **tabela com colunas:**
  - ID
  - Nome
  - Classe
  - Nível
  - Ações (Editar/Deletar)

### **3. Editar Personagem**
1. Clique no botão **"Editar"** do personagem
2. Preencha os novos dados nos prompts
3. O personagem será atualizado

### **4. Deletar Personagem**
1. Clique no botão **"Deletar"** do personagem
2. Confirme a exclusão
3. O personagem será removido

---

## 🔗 Integração com Backend

A aplicação tenta conectar automaticamente com a API em `http://127.0.0.1:5000`.

- **Se a API estiver rodando:** Dados são salvos no banco SQLite
- **Se a API não estiver disponível:** Fallback para LocalStorage do navegador

### **Configurar URL da API**
Para alterar a URL da API, edite a constante `API_BASE_URL` no arquivo `app.js`:

```javascript
const API_BASE_URL = 'http://127.0.0.1:5000'; // Altere para sua URL
```

---

## 🎨 Personalização

### **Estilos CSS**
O arquivo `style.css` contém:
- Design responsivo
- Tema escuro/claro
- Animações suaves
- Layout mobile-first

### **Funcionalidades JavaScript**
O arquivo `app.js` inclui:
- CRUD completo
- Validação de formulários
- Tratamento de erros
- Fallback automático

---

## 📱 Compatibilidade

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers

---

## 📝 Licença

Este projeto é parte do trabalho acadêmico de Pós-Graduação em Desenvolvimento Full Stack - PUC-RJ.

---

## 👥 Autor

**Leonardo Camargo** - [GitHub](https://github.com/leonardoccamargo)

---

### **Opção 2: Servidor HTTP Simples**

Se não quiser usar Flask, crie um servidor local simples:

#### **Python:**
```bash
cd frontend
python -m http.server 8000
# Acesse: http://localhost:8000
```

#### **Node.js (http-server):**
```bash
npm install -g http-server
cd frontend
http-server
```

---

## 🎯 Como Usar a Aplicação

### **1. Adicionar Personagem**
1. Preencha os campos:
   - **Nome do Personagem:** Nome único
   - **Classe:** Guerreiro, Mago, Arqueiro, etc.
   - **Nível:** Número entre 1-99
2. Clique em **"Adicionar Personagem"**
3. O personagem aparecerá na tabela abaixo

### **2. Visualizar Personagens**
- Todos os personagens aparecem em uma **tabela com colunas:**
  - ID
  - Nome
  - Classe
  - Nível
  - Ações (Editar/Deletar)

### **3. Editar Personagem**
1. Clique no botão **"Editar"** do personagem
2. Preencha os novos dados nos prompts
3. O personagem será atualizado

### **4. Deletar Personagem**
1. Clique no botão **"Deletar"** do personagem
2. Confirme a exclusão
3. O personagem será removido

---

## 🔌 Integração com a API

### **Rotas Chamadas**

O frontend chama as seguintes rotas da API:

| Ação | Método | Rota | Descrição |
|------|--------|------|-----------|
| Listar | GET | `/api/personagens` | Carrega todos os personagens |
| Criar | POST | `/api/personagens` | Cria novo personagem |
| Buscar | GET | `/api/personagens/<id>` | Obtém um personagem pelo ID |
| Atualizar | PUT | `/api/personagens/<id>` | Atualiza um personagem |
| Deletar | DELETE | `/api/personagens/<id>` | Remove um personagem |
| Verificar | GET | `/api/hello` | Verifica se API está online |

---

## 💾 Persistência de Dados

### **Se Backend está rodando (API disponível):**
- ✅ Dados salvos no **SQLite** (banco de dados)
- ✅ Compartilhados entre usuários
- ✅ Persistem após reiniciar servidor

### **Se Backend não está disponível (Fallback):**
- ✅ Dados salvos no **localStorage** do navegador
- ✅ Persistem ao fechar/reabrir o navegador
- ✅ Locais para cada navegador

---

## 🎨 Customização e Estilo

### **Arquivo: `style.css`**

Contém:
- ✅ Layout responsivo com Flexbox
- ✅ Cores e tipografia profissionais
- ✅ Botões estilizados com efeitos hover
- ✅ Tabela com zebra striping
- ✅ Mensagens com cores diferentes (sucesso, erro, aviso)

### **Modificar Cores**

Edite as variáveis CSS no início do `style.css`:

```css
:root {
  --cor-primaria: #2c3e50;
  --cor-sucesso: #27ae60;
  --cor-erro: #e74c3c;
  --cor-aviso: #f39c12;
}
```

---

## 📱 Responsividade

A aplicação é totalmente responsiva:

| Tamanho | Breakpoint | Comportamento |
|---------|-----------|---------------|
| Mobile | < 768px | Layout em coluna única |
| Tablet | 768px - 1024px | Layout otimizado |
| Desktop | > 1024px | Layout full (2 colunas) |

---

## 🔒 Validações

### **Frontend:**
- ❌ Rejeita nomes vazios
- ❌ Rejeita classes vazias
- ❌ Rejeita níveis inválidos (< 1)
- ❌ Detecta nomes duplicados
- ✅ Oferece feedback visual

### **Backend (API):**
- ❌ Valida dados recebidos
- ❌ Verifica integridade
- ✅ Retorna erros descritivos com HTTP status

---

## 🔍 Requisições da API (Exemplos)

### **Criar Personagem**
```javascript
fetch('http://127.0.0.1:5000/api/personagens', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Aragorn',
    classe: 'Guerreiro',
    nivel: 15
  })
})
.then(res => res.json())
.then(data => console.log(data))
```

### **Listar Todos**
```javascript
fetch('http://127.0.0.1:5000/api/personagens')
  .then(res => res.json())
  .then(data => console.log(data.personagens))
```

### **Atualizar Personagem**
```javascript
fetch('http://127.0.0.1:5000/api/personagens/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Aragorn II',
    classe: 'Rei',
    nivel: 20
  })
})
```

### **Deletar Personagem**
```javascript
fetch('http://127.0.0.1:5000/api/personagens/1', {
  method: 'DELETE'
})
```

---

## 🛠️ Arquitetura do Código

### **Organização JavaScript**

```javascript
// 1. Configuração da API
const API_BASE_URL = 'http://127.0.0.1:5000';
const useLocalStorage = false;

// 2. Elementos do DOM
const formulario = document.getElementById('personagemForm');

// 3. Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  await verificarConexaoAPI();
  await carregarPersonagens();
});

// 4. Funções de Carregamento
async function carregarPersonagens() { ... }

// 5. Funções CRUD
async function criarPersonagem() { ... }
async function deletarPersonagem(id) { ... }
async function abrirEditarPersonagem(id) { ... }

// 6. Fallbacks para localStorage
function criarPersonagemLocal() { ... }
```

---

## 📊 Fluxo de Dados

```
Usuario → HTML Form
    ↓
JavaScript Valida
    ↓
fetch() → API (Backend)
    ↓
SQLite (Banco de Dados)
    ↓
Resposta JSON
    ↓
Atualizar Tabela (DOM)
```

---

## 🐛 Troubleshooting

### **"Erro ao conectar com a API"**
- ✅ Verifique se o Backend está rodando: `http://127.0.0.1:5000`
- ✅ Abra Console do Navegador (F12) e veja os erros
- ✅ Se usando arquivo local, certifique-se que usa `http://` não `file://`

### **Dados não aparecem na tabela**
- ✅ Abra Console (F12) e procure por erros
- ✅ Verifique se tem personagens cadastrados
- ✅ Limpe o localStorage: `localStorage.clear()`

### **Formulário não funciona**
- ✅ Verifique se tem internet (se usando API)
- ✅ Recarregue a página (Ctrl+F5)
- ✅ Limpe cache do navegador

---

## 🎯 Funcionalidades Extras (Bônus)

1. **Fallback LocalStorage** - Funciona offline
2. **Validação em Tempo Real** - Feedback instantâneo
3. **Detecção de Conexão** - Avisa se API não disponível
4. **Mensagens Contextuais** - Diferentes cores para sucesso/erro
5. **Edição Inline** - Modal para editar dados
6. **Confirmação de Exclusão** - Dialogo antes de deletar

---

## 📄 Estrutura HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <title>RPG Character Manager</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <div class="container">
      <!-- Formulário de Cadastro -->
      <section class="form-section">
        <form id="personagemForm">...</form>
      </section>

      <!-- Tabela de Personagens -->
      <section class="table-section">
        <table id="personagensTable">
          <tbody id="personagensBody">...</tbody>
        </table>
      </section>
    </div>

    <script src="app.js"></script>
  </body>
</html>
```

---

## 💡 Dicas de Desenvolvimento

### **Debugging**
```javascript
// Abra o Console do Navegador (F12)
// Digite: localStorage.getItem('personagens_rpg')
// Para ver todos os dados salvos localmente
```

### **Testes Manuais**
1. Criar 5 personagens
2. Editar 2 deles
3. Deletar 1
4. Recarregar página (F5) - dados devem estar lá
5. Fechar abas/navegador e reabrir
6. Dados devem persistir (API ou localStorage)

---

## 🔄 Fluxo de Requisição/Resposta

### **Criar Personagem**
```
Frontend (app.js)
  ↓
POST /api/personagens
  ↓
Backend (routes.py)
  ↓
Valida dados
  ↓
SQLite (INSERT)
  ↓
{status: "success", personagem: {...}}
  ↓
Frontend atualiza tabela
```

---

## 📚 Boas Práticas Implementadas

- ✅ Funções bem organizadas e comentadas
- ✅ Tratamento de erros com try/catch
- ✅ Validações antes de enviar
- ✅ Feedback visual ao usuário
- ✅ Código responsivo e limpo
- ✅ Comments explicativos
- ✅ Separação de responsabilidades

---

## 📝 Notas Importantes

- **Sem frameworks:** Só JavaScript puro (vanilla)
- **Sem dependências npm:** Funciona direto no navegador
- **Sem CORS issues:** Backend habilitado com Flask-CORS
- **Sem banco de dados cliente:** Usa localStorage como fallback
- **Suporta offline:** Funciona sem internet

---

## 🤝 Suporte

Dúvidas? Verifique:
1. Se o Backend está rodando
2. Console do navegador (F12) para erros
3. Arquivo README.md do Backend para mais info

---

## 👤 Autor

Desenvolvido por Leonardo Castillo Camargo, Pós-Graduando da PUC-RJ.

---

**Enjoy! 🚀**
