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
# AgendaFácil

Sistema de agendamento online para barbearias. Interface em React (Vite) e API em Node.js/Express; o banco de dados usa MySQL.

**Status de hospedagem:**
- Frontend: hospedado no Vercel (deploy e CDN para a interface).
- Backend e Banco: hospedados como serviço gerenciado na Aiven (aiven.io) — a API pública é consumida pelo frontend em produção.

**O que é o projeto**
- Plataforma simples para clientes agendarem serviços de barbearia e para barbeiros gerenciarem horários e serviços.
- Suporta autenticação de dois tipos de usuário: Cliente e Barbeiro.

**Como funciona (fluxo resumido)**
- Cliente: cria conta → faz login → escolhe serviço e horário → agenda → recebe confirmação.
- Barbeiro: faz login → visualiza agenda → confirma/recusa horários, gerencia serviços e disponibilidade.
- Frontend consome a API REST hospedada na Aiven; o backend faz persistência em MySQL gerenciado.

**Arquitetura (resumo)**
- `agendafacil/` — Frontend React + Vite, deploy no Vercel.
- `agendafacilBackend/` — Backend Node.js/Express, deploy hospedado na Aiven; banco MySQL gerenciado pela Aiven.
- Comunicação via HTTPS com endpoints REST. Variáveis de ambiente definem a `BACKEND_URL` usada pelo frontend em produção.

**Contas de teste**
- Barbeiro (administrador)
	- Email: barbeiro@agendafacil.com
	- Senha: barbeiro123
- Cliente
	- Email: cliente@agendafacil.com
	- Senha: cliente123

**Desenvolvimento local (resumo)**
- O repositório contém dois projetos: frontend (`agendafacil/`) e backend (`agendafacilBackend/`).
- Para testar localmente, rode ambos em paralelo ou aponte o frontend para a `BACKEND_URL` da Aiven. Ajuste as variáveis de ambiente no Vercel quando for fazer o deploy.

**Observações de produção**
- Nunca versionar credenciais: use as configurações de ambiente do Vercel e as informações de serviço fornecidas pela Aiven.
- Em produção, aproveite os recursos gerenciados (backups e alta disponibilidade) que a Aiven oferece para o banco.

---

Desenvolvido com ❤️ para AgendaFácil