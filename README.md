# AgendaFácil

Sistema de agendamento online para barbearias com React (frontend) e Node.js (backend).

OBS: Este projeto está atualmente hospedado em produção no Vercel (frontend). O backend está hospedado como serviço gerenciado na Aiven (aiven.io). Para desenvolvimento local, siga as instruções abaixo.

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

Nota: Em produção o banco e a API estão hospedados na Aiven (serviço gerenciado). As credenciais e a URL da API em produção são diferentes das usadas localmente; use variáveis de ambiente para apontar para o serviço Aiven quando fizer deploy no Vercel.

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

Em produção: o backend está implantado em Aiven (aiven.io). A aplicação frontend no Vercel consome a API pública hospedada na Aiven.

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

Produção: quando usar o backend hospedado na Aiven, atualize as variáveis de ambiente no painel do Vercel para apontar a `BACKEND_URL` (ex.: `https://sua-api-aiven.example`) e as credenciais do banco fornecidas pela Aiven. Não versionar credenciais em código.

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