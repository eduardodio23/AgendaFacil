# 🔧 Configuração e Alterações Realizadas

## ✅ Problema Resolvido: Erro "Erro de conexão com a API"

### Causa do Erro
O backend estava tentando conectar a um banco de dados **PostgreSQL** por padrão (linha 24 do `index.js`), mas você não possui nenhum banco de dados instalado. A conexão falhava, causando o erro de API.

### Solução Implementada
1. **Configuração com Variáveis de Ambiente** - Agora o backend usa um arquivo `.env` para ler as configurações
2. **Suporte a MySQL e PostgreSQL** - Pode usar qualquer um dos dois bancos de dados

---

## 📋 Como Configurar (IMPORTANTE!)

### 1. Instalar Dependências do Backend
```bash
cd agendafacilBackend
npm install
```

### 2. Configurar o Arquivo `.env`
Abra o arquivo `.env` na raiz de `agendafacilBackend` e configure:

**Para MySQL:**
```env
DATABASE_URL=mysql://root:@localhost:3306/agendafacil
PORT=3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app-gmail
SMTP_FROM=seu-email@gmail.com
FRONTEND_URL=http://localhost:5173
```

**Nota:** Ajuste o `root` e a porta (3306) conforme suas credenciais do MySQL.

### 3. Criar Banco de Dados (Opcional, Sequelize faz automaticamente)
Se quiser criar manualmente:
```sql
CREATE DATABASE agendafacil CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Iniciar o Backend
```bash
npm start
```

Você deve ver:
```
🚀 Servidor rodando em http://localhost:3000
✅ Banco de dados sincronizado.
```

---

## 🆕 Novas Funcionalidades Implementadas

### 1. ✉️ Validação de Email (Apenas Empresas Conhecidas)
**Domínios aceitos:**
- Gmail
- Hotmail
- Outlook
- iCloud
- Yahoo
- ProtonMail
- AOL
- Terra
- UOL
- IG
- Globo
- Live
- MSN
- Ymail
- Mail

**Mensagem de erro se usar email diferente:**
> "Por favor, use um email de uma empresa conhecida (Gmail, Hotmail, Outlook, iCloud, Yahoo, etc.)"

### 2. 📅 Validação de Mês (Máximo 12)
- Implementada validação que garante que o mês da data de nascimento não ultrapasse 12
- Aplica-se tanto no frontend quanto no backend

### 3. 🔐 Funcionalidade "Esqueci a Senha"
**Fluxo:**
1. Usuário clica em "Esqueci minha senha" na página de login
2. É redirecionado para `/esqueci-senha`
3. Insere seu email e clica em "Enviar Link de Reset"
4. Um email é enviado com um link de reset de senha
5. Link expira em 1 hora por segurança

**Endpoints:**
- `POST /esqueci-senha` - Solicitar reset
- `GET /validar-reset-token/:token` - Validar token
- `POST /resetar-senha` - Resetar senha com token

### 4. 📧 Configuração de Email (Gmail)
Para enviar emails, use a autenticação de aplicativo do Gmail:

**Passos:**
1. Acesse https://myaccount.google.com/apppasswords
2. Selecione "Mail" e "Windows Computer" (ou seu dispositivo)
3. Copie a senha de 16 caracteres
4. Coloque em `SMTP_PASS` no arquivo `.env`

**Exemplo:**
```env
SMTP_USER=seu-email@gmail.com
SMTP_PASS=xyza bcde fghi jklm
```

---

## 🗂️ Estrutura de Pastas Criadas

```
agendafacil/src/Pages/
├── EsqueciSenha/
│   ├── index.jsx      (Página de solicitação de reset)
│   └── style.css
└── ResetSenha/
    ├── index.jsx      (Página de reset com token)
    └── style.css
```

---

## 🔄 Rotas Adicionadas

### Frontend (`App.jsx`)
```javascript
<Route path="/esqueci-senha" element={<EsqueciSenha />} />
<Route path="/reset-senha/:token" element={<ResetSenha />} />
```

### Backend (index.js)
```
POST   /cadastro              - Cadastro com validações
POST   /esqueci-senha         - Solicitar reset de senha
GET    /validar-reset-token/:token - Validar token
POST   /resetar-senha         - Resetar senha
```

---

## ✅ Validações Implementadas

### Frontend
- ✅ Email apenas de empresas conhecidas
- ✅ Mês de nascimento não ultrapassa 12
- ✅ Senha mínimo 6 caracteres
- ✅ Confirmação de senha

### Backend
- ✅ Email apenas de empresas conhecidas
- ✅ Validação de mês
- ✅ Token de reset com expiração (1 hora)
- ✅ Prevenção de duplicatas de email
- ✅ Hash de senhas (considera implementar bcrypt no futuro)

---

## ⚠️ Notas Importantes

1. **Banco de Dados:** Se tiver erro de conexão ao iniciar, verifique se MySQL está rodando e se a URL em `.env` está correta.

2. **Email:** Se não configurar SMTP, o sistema continuará funcionando mas não enviará emails. Uma mensagem de aviso aparecerá no console.

3. **Token de Reset:** Válido por 1 hora após a solicitação. Usuário precisa clicar no link dentro deste período.

4. **Segurança:** 
   - Tokens são aleatórios e únicos
   - Emails não revelam se existem ou não na base de dados
   - Senhas expiradas após reset

---

## 🚀 Próximos Passos (Recomendado)

1. Instalar `bcryptjs` para hash de senhas:
   ```bash
   npm install bcryptjs
   ```

2. Implementar rate limiting para evitar brute force

3. Adicionar autenticação JWT para melhor segurança

4. Testar com diferentes provedores de email (SendGrid, Mailgun, etc.)

---

## 📞 Suporte

Se tiver problemas:
- Verifique se a porta 3000 está disponível
- Confirme as credenciais do MySQL/PostgreSQL
- Verifique se SMTP_USER e SMTP_PASS estão corretos
- Consulte os logs no console do Node.js
