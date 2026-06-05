# AgendaFácil

Sistema de agendamento online para barbearias com React (frontend) e Node.js (backend).

## ⚡ Quick Start (5 minutos)

### 1. Pré-requisitos
- **Node.js** v14+ ([Baixar](https://nodejs.org/))
- **MySQL** 5.7+ ([Baixar](https://www.mysql.com/downloads/))

### 2. Banco de Dados
Abra o MySQL e execute:
```sql
CREATE DATABASE agendafacil;
USE agendafacil;
```

### 3. Instalar dependências

**Frontend:**
```bash
cd agendafacil
npm install
npm run dev
```
Acesse: http://localhost:5173

**Backend (novo terminal):**
```bash
cd agendafacilBackend
npm install
node index.js
```

## 🧪 Contas de Teste

### Barbeiro (Conta Administradora)
- **Email:** barbeiro@agendafacil.com
- **Senha:** barbeiro123
- Acesso: Gerenciar serviços, agendamentos e painel administrativo do barbeiro

### Cliente
- **Email:** cliente@agendafacil.com
- **Senha:** cliente123
- Acesso: Agendar serviços e visualizar agendamentos

## 📋 Funcionalidades

- ✅ Autenticação de usuários (Cliente e Barbeiro)
- ✅ Agendamento de serviços
- ✅ Gerenciamento de agendamentos
- ✅ Painel do barbeiro
- ✅ Visualização de serviços

## 📁 Estrutura

```
AgendaFacil/
├── agendafacil/           # Frontend (React + Vite)
└── agendafacilBackend/    # Backend (Node.js + Express)
```

## 📝 Comandos Frontend

```bash
npm run dev       # Iniciar desenvolvimento
npm run build     # Build para produção
npm run lint      # Verificar código
npm run preview   # Preview da build
```

## 📝 Comandos Git

```bash
git pull                    # Trazer mudanças
git add .                   # Adicionar arquivos
git commit -m "mensagem"    # Criar versão
git push                    # Enviar mudanças
```

## ⚙️ Configuração

### Credenciais do Banco
Edite `agendafacilBackend/index.js` se precisar alterar:
- Usuário: `root`
- Senha: `12345678`
- Banco: `agendafacil`

### Reset do Banco (se necessário)
```sql
DROP DATABASE agendafacil;
CREATE DATABASE agendafacil;
USE agendafacil;
```

## 🐛 Problemas Comuns

| Problema | Solução |
|----------|---------|
| MySQL não conecta | Verifique se o MySQL está rodando e credenciais estão corretas |
| Porta em uso | Mude a porta em `vite.config.js` (frontend) ou `index.js` (backend) |
| Frontend não conecta ao backend | Confirme se o backend está rodando na porta correta |

## 📱 Navegação

- **Login** - Acesso ao sistema
- **Cadastro** - Criar nova conta
- **Agendamentos** - Ver serviços disponíveis
- **Meus Agendamentos** - Histórico de agendamentos
- **Barbeiro** - Painel do profissional
- **Página Principal** - Dashboard
- **Sobre Nós** - Informações

---

**Desenvolvido com ❤️ para AgendaFácil**