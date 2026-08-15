# 🚀 Guia de Hospedagem - AgendaFácil

## 📱 FRONTEND - Vercel (Recomendado)

### Opção 1: Deploy Automático (Git)
1. **Conecte seu repositório:**
   - Acesse https://vercel.com
   - Clique "New Project"
   - Selecione seu repositório do GitHub/GitLab
   - Vercel detecta automaticamente (Vite React)

2. **Configure Variáveis de Ambiente:**
   - Na aba "Settings" → "Environment Variables"
   - Adicione:
   ```
   VITE_API_URL=https://seu-backend.com
   ```

3. **Deploy:**
   - Clique "Deploy"
   - Pronto! Seu site está em `seu-projeto.vercel.app`

### Opção 2: Deploy Manual
```bash
cd agendafacil
npm install -g vercel
vercel login
vercel
```

---

## 🔧 BACKEND - Escolha uma opção:

### Opção A: Railway (Mais Fácil) ⭐ RECOMENDADO
1. **Acesse:** https://railway.app
2. **Crie nova conta (GitHub)**
3. **New Project** → **Deploy from GitHub**
4. **Selecione seu repositório**
5. **Railway detects Node.js automaticamente**

**Configurar Banco de Dados:**
- Na aba "Variables", clique "Add Variable"
- Copie a `DATABASE_URL` gerada automaticamente do PostgreSQL do Railway
- Seu `.env` será:
  ```
  DATABASE_URL=postgresql://user:pass@host:5432/db
  PORT=3000
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=seu-email@gmail.com
  SMTP_PASS=sua-senha-app
  SMTP_FROM=seu-email@gmail.com
  FRONTEND_URL=https://seu-site.vercel.app
  ```

**Deploy:**
- Railway faz deploy automático quando você faz push no GitHub
- URL será: `seu-projeto-production.up.railway.app`

---

### Opção B: Render.com
1. **Acesse:** https://render.com
2. **New +** → **Web Service**
3. **Connect GitHub**
4. **Selecione repositório**
5. **Configurações:**
   - Runtime: Node
   - Build: `npm install`
   - Start: `npm start`
6. **Environment Variables** (mesmas acima)
7. **Create Web Service**

---

### Opção C: Heroku (Pago agora) 
⚠️ Heroku não oferece plano gratuito mais
Mas se tiver crédito:
```bash
heroku login
heroku create seu-app-name
git push heroku main
heroku config:set DATABASE_URL="sua-url"
```

---

## 🗄️ BANCO DE DADOS - Opções Gratuitas

### PostgreSQL (Recomendado)

**Opção 1: Railway PostgreSQL**
- ✅ Incluso no Railway
- ✅ Grátis até certo limite
- URL automática fornecida

**Opção 2: ElephantSQL**
1. Acesse: https://www.elephantsql.com
2. Crie conta
3. **Create New Instance** → Free (20MB)
4. Copie URL: `postgresql://user:pass@...`

**Opção 3: Supabase (PostgreSQL + Auth)**
1. https://supabase.com
2. Create new project
3. Copie connection string
4. Use em `DATABASE_URL`

### SQLite (Mais Simples)
- Atual: `DATABASE_URL=sqlite:./agendafacil.db`
- ✅ Funciona local e em produção
- ❌ Não ideal para múltiplos acessos simultâneos

---

## 📋 Passo a Passo Rápido (Railway)

### 1️⃣ Prepare o Backend
```bash
# No agendafacilBackend/package.json certifique-se que tem:
"scripts": {
  "start": "node index.js"
}

# Atualize .env.example (não .env - este é local)
```

### 2️⃣ Push no GitHub
```bash
git add .
git commit -m "Preparar para hospedagem"
git push origin main
```

### 3️⃣ Crie no Railway
- Conecte GitHub
- Selecione repo
- Railway detecta Node automaticamente
- Cria PostgreSQL automático

### 4️⃣ Configure Variáveis
```
DATABASE_URL = (automático do Railway)
PORT = 3000
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = seu-email@gmail.com
SMTP_PASS = sua-senha-app
SMTP_FROM = seu-email@gmail.com
FRONTEND_URL = https://seu-vercel-app.vercel.app
```

### 5️⃣ Deploy Frontend
- Vercel detecta automaticamente
- Adicione `VITE_API_URL=https://seu-backend-railway.up.railway.app`

---

## ✅ Checklist Final

- [ ] Backend rodando em Railway/Render
- [ ] PostgreSQL conectado
- [ ] `DATABASE_URL` configurada no backend
- [ ] SMTP configurado para email
- [ ] Frontend no Vercel
- [ ] `VITE_API_URL` apontando para backend correto
- [ ] Testar login/cadastro/esqueci-senha

---

## 🧪 Testar em Produção

```bash
# Frontend
https://seu-app.vercel.app

# API
https://seu-backend.railway.app/usuarios

# Reset de Senha
Link enviado por email com: https://seu-app.vercel.app/reset-senha/:token
```

---

## 💡 Dicas

1. **Variáveis de Ambiente:**
   - Nunca coloque `.env` no GitHub
   - Use `git ignore` para `.env`
   - Configure tudo via painel de hospedagem

2. **Domínios Customizados:**
   - **Vercel:** Compre domínio → Configure em "Domains"
   - **Railway:** Adicione domínio em "Custom Domain"

3. **SSL/HTTPS:**
   - ✅ Automático em Vercel e Railway
   - Necessário para emails funcionarem

4. **Monitoramento:**
   - Railway: Logs automáticos
   - Vercel: Analytics em painel
   - Consulte logs se tiver erros

---

## 🆘 Problemas Comuns

**"ECONNREFUSED" em produção:**
- DATABASE_URL está faltando ou errada
- Verifique nas Environment Variables

**"Email não funciona":**
- SMTP_PASS não é sua senha normal do Gmail
- Use: https://myaccount.google.com/apppasswords
- Gere nova senha de app

**Frontend não conecta ao backend:**
- VITE_API_URL está configurado?
- URL termina com `.app` ou `.up.railway.app`?
- Sem `/` no final da URL

---

## 📞 Links Úteis

- Railway: https://railway.app
- Vercel: https://vercel.com
- Supabase: https://supabase.com
- ElephantSQL: https://www.elephantsql.com
- Gmail App Passwords: https://myaccount.google.com/apppasswords
