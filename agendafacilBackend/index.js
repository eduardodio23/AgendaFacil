require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Sequelize, DataTypes, Op } = require('sequelize');
const { buildAvailability } = require('./bookingLogic');

// Configuração de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

// Lista de domínios de email permitidos (empresas conhecidas)
const allowedEmailDomains = [
  'gmail.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'yahoo.com',
  'mail.com', 'protonmail.com', 'aol.com', 'terra.com.br', 'uol.com.br',
  'ig.com.br', 'globo.com', 'live.com', 'msn.com', 'ymail.com'
];

// Função para validar email
function isValidEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain && allowedEmailDomains.includes(domain);
}

// Função para validar mês (não pode ultrapassar 12)
function isValidMonth(dateString) {
  if (!dateString) return true;
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  return month <= 12;
}

// Função para enviar email
async function sendEmail(to, subject, html) {
  if (!process.env.SMTP_USER) {
    console.warn('⚠️ SMTP não configurado. Email não será enviado.');
    return false;
  }
  
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
}

// Tentar múltiplas variáveis que Railway ou outros provedores podem usar
const databaseUrl = process.env.DATABASE_URL ||
                    process.env.POSTGRES_URL ||
                    process.env.DB_URL ||
                    process.env.RAILWAY_DATABASE_URL ||
                    process.env.PG_CONNECTION_STRING ||
                    process.env.PG_URI ||
                    process.env.POSTGRESQL_URL ||
                    process.env.DATABASE;

let sequelize;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL não encontrada!');
  console.error('Variáveis disponíveis:', Object.keys(process.env).filter(k => /DB|POST|PG|DATABASE/i.test(k)));
  console.error('Por favor, configure PostgreSQL no Railway e adicione DATABASE_URL nas Variables');
  process.exit(1);
}

// Detectar dialect a partir da URL
let dialect = 'postgres';
if (/mysql:\/\//i.test(databaseUrl)) dialect = 'mysql';
else if (/postgres(?:ql)?:\/\//i.test(databaseUrl)) dialect = 'postgres';

const sequelizeOptions = {
  dialect,
  logging: false
};

// Configurar SSL apenas para Postgres quando necessário
if (dialect === 'postgres') {
  const useSsl = process.env.DB_SSL === 'true' || /ssl-mode=REQUIRED/i.test(databaseUrl) || process.env.NODE_ENV === 'production';
  if (useSsl) {
    sequelizeOptions.dialectOptions = {
      ssl: { require: true, rejectUnauthorized: false }
    };
  }
}

sequelize = new Sequelize(databaseUrl, sequelizeOptions);
console.log(`✅ Conectado ao banco (${dialect})`);

const Usuario = sequelize.define('Usuario', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false
  },
  data_nascimento: {
    type: DataTypes.DATE,
    allowNull: false
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'cliente'
  },
  reset_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reset_token_expiry: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

const Agendamento = sequelize.define('Agendamento', {
  servico: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profissional: {
    type: DataTypes.STRING,
    allowNull: false
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  horario: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  forma_pagamento: {
    type: DataTypes.STRING,
    allowNull: true
  },
  faturado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  canceled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  extra: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'agendado'
  }
});

Usuario.hasMany(Agendamento, { foreignKey: 'usuarioId' });
Agendamento.belongsTo(Usuario, { foreignKey: 'usuarioId' });

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

function serializeAgendamento(agendamento) {
  return {
    ...agendamento.toJSON(),
    status: agendamento.canceled ? 'cancelado' : agendamento.status || 'agendado'
  };
}

app.get('/usuarios', async (req, res) => {
  try {
    const todosOsUsuarios = await Usuario.findAll({ attributes: { exclude: ['senha'] } });
    res.json(todosOsUsuarios);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
});

app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, telefone, cpf, data_nascimento, senha } = req.body;
    if (!nome || !email || !telefone || !cpf || !data_nascimento || !senha) {
      return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    const novoUsuario = await Usuario.create({
      nome,
      email,
      telefone,
      cpf,
      data_nascimento,
      senha,
      role: 'cliente'
    });

    const usuarioSeguranca = {
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      role: novoUsuario.role,
      telefone: novoUsuario.telefone
    };

    res.status(201).json({ message: 'Usuário criado com sucesso', usuario: usuarioSeguranca });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
});

// Endpoint para cadastro com validações
app.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, telefone, cpf, data_nascimento, senha } = req.body;
    
    // Validações
    if (!nome || !email || !telefone || !cpf || !data_nascimento || !senha) {
      return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    // Validar email (apenas empresas conhecidas)
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Por favor, use um email de uma empresa conhecida (Gmail, Hotmail, Outlook, iCloud, Yahoo, etc.)' });
    }

    // Validar mês de nascimento
    if (!isValidMonth(data_nascimento)) {
      return res.status(400).json({ message: 'Data de nascimento inválida' });
    }

    // Validar comprimento mínimo de senha
    if (senha.length < 6) {
      return res.status(400).json({ message: 'Senha deve ter no mínimo 6 caracteres' });
    }

    const novoUsuario = await Usuario.create({
      nome,
      email,
      telefone,
      cpf,
      data_nascimento,
      senha,
      role: 'cliente'
    });

    const usuarioSeguranca = {
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      role: novoUsuario.role,
      telefone: novoUsuario.telefone
    };

    res.status(201).json({ message: 'Cadastro realizado com sucesso!', usuario: usuarioSeguranca });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Este email já está cadastrado. Por favor, use outro email.' });
    }
    res.status(500).json({ message: 'Erro ao cadastrar usuário' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ message: 'O email e a senha são obrigatórios' });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const usuarioRetorno = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      role: usuario.role
    };

    res.json({ message: 'Login realizado com sucesso', usuario: usuarioRetorno });
  } catch (error) {
    console.error('Erro ao processar login:', error);
    res.status(500).json({ message: 'Erro interno no login' });
  }
});

// Endpoint para solicitar reset de senha
app.post('/esqueci-senha', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      // Por segurança, não informamos se o email existe ou não
      return res.status(200).json({ message: 'Se o email existe em nossa base de dados, você receberá um link para resetar sua senha.' });
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    usuario.reset_token = resetToken;
    usuario.reset_token_expiry = resetTokenExpiry;
    await usuario.save();

    // Enviar email com link de reset
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-senha/${resetToken}`;
    const htmlContent = `
      <h2>Resetar sua senha</h2>
      <p>Olá ${usuario.nome},</p>
      <p>Você solicitou um reset de senha. Clique no link abaixo para criar uma nova senha:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Resetar Senha</a>
      <p>Este link expira em 1 hora.</p>
      <p>Se você não solicitou isto, ignore este email.</p>
      <p>Atenciosamente,<br>Equipe AgendaFácil</p>
    `;

    const emailSent = await sendEmail(email, 'Reset de Senha - AgendaFácil', htmlContent);
    
    if (!emailSent) {
      console.warn('⚠️ Email não foi enviado, mas token foi gerado');
    }

    res.status(200).json({ message: 'Se o email existe em nossa base de dados, você receberá um link para resetar sua senha.' });
  } catch (error) {
    console.error('Erro ao processar esqueci senha:', error);
    res.status(500).json({ message: 'Erro ao processar solicitação' });
  }
});

// Endpoint para validar token de reset
app.get('/validar-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const usuario = await Usuario.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!usuario) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    res.json({ message: 'Token válido', email: usuario.email });
  } catch (error) {
    console.error('Erro ao validar token:', error);
    res.status(500).json({ message: 'Erro ao validar token' });
  }
});

// Endpoint para resetar senha
app.post('/resetar-senha', async (req, res) => {
  try {
    const { token, novaSenha, confirmarSenha } = req.body;

    if (!token || !novaSenha || !confirmarSenha) {
      return res.status(400).json({ message: 'Token e nova senha são obrigatórios' });
    }

    if (novaSenha !== confirmarSenha) {
      return res.status(400).json({ message: 'As senhas não coincidem' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ message: 'Senha deve ter no mínimo 6 caracteres' });
    }

    const usuario = await Usuario.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!usuario) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    // Atualizar senha
    usuario.senha = novaSenha;
    usuario.reset_token = null;
    usuario.reset_token_expiry = null;
    await usuario.save();

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    res.status(500).json({ message: 'Erro ao resetar senha' });
  }
});

app.get('/agendamentos', async (req, res) => {
  try {
    const agendamentos = await Agendamento.findAll({
      include: [{ model: Usuario, attributes: ['id', 'nome', 'email', 'telefone'] }],
      order: [['data', 'ASC'], ['horario', 'ASC']]
    });
    res.json(agendamentos.map(serializeAgendamento));
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos' });
  }
});

app.get('/agendamentos/semana', async (req, res) => {
  try {
    const hoje = new Date();
    const seteDias = new Date();
    seteDias.setDate(hoje.getDate() + 7);

    const agendamentosDaSemana = await Agendamento.findAll({
      where: {
        data: {
          [Op.between]: [hoje.toISOString().split('T')[0], seteDias.toISOString().split('T')[0]]
        }
      },
      include: [{ model: Usuario, attributes: ['id', 'nome', 'email', 'telefone'] }],
      order: [['data', 'ASC'], ['horario', 'ASC']]
    });
    res.json(agendamentosDaSemana.map(serializeAgendamento));
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos da semana' });
  }
});

app.get('/agendamentos/usuario/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const agendamentos = await Agendamento.findAll({
      where: { usuarioId },
      order: [['data', 'ASC'], ['horario', 'ASC']]
    });
    res.json(agendamentos.map(serializeAgendamento));
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos do usuário' });
  }
});

app.get('/agendamentos/disponibilidade', async (req, res) => {
  try {
    const { profissional, data } = req.query;

    if (!profissional || !data) {
      return res.status(400).json({ message: 'Profissional e data são obrigatórios' });
    }

    const agendamentos = await Agendamento.findAll({
      where: {
        profissional,
        data,
        canceled: false
      },
      order: [['horario', 'ASC']]
    });

    res.json(buildAvailability(data, profissional, agendamentos));
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error);
    res.status(500).json({ message: 'Erro ao buscar disponibilidade' });
  }
});

app.post('/agendamentos', async (req, res) => {
  try {
    const {
      usuarioId,
      servico,
      profissional,
      data,
      horario,
      telefone,
      valor,
      observacoes,
      extra = false
    } = req.body;

    if (!usuarioId || !servico || !profissional || !data || !horario || !telefone || valor == null) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' });
    }

    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const agendamentosNoHorario = await Agendamento.findAll({
      where: {
        profissional,
        data,
        horario,
        canceled: false
      }
    });

    const conflito = agendamentosNoHorario.some((item) => !item.extra && !extra);

    if (conflito) {
      return res.status(409).json({
        message: 'Já existe um agendamento confirmado para este profissional neste horário. Você pode marcar como extra se quiser.',
        conflict: true
      });
    }

    const novoAgendamento = await Agendamento.create({
      usuarioId,
      servico,
      profissional,
      data,
      horario,
      telefone,
      valor,
      observacoes: observacoes || '',
      canceled: false,
      faturado: false,
      extra,
      status: extra ? 'extra' : 'agendado'
    });

    res.status(201).json({ message: 'Agendamento criado com sucesso', agendamento: serializeAgendamento(novoAgendamento) });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ message: 'Erro ao criar agendamento' });
  }
});

app.put('/agendamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { servico, profissional, data, horario, telefone, valor, observacoes } = req.body;

    const agendamento = await Agendamento.findByPk(id);
    if (!agendamento) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    if (agendamento.canceled) {
      return res.status(400).json({ message: 'Não é possível editar um agendamento cancelado' });
    }

    if (servico) agendamento.servico = servico;
    if (profissional) agendamento.profissional = profissional;
    if (data) agendamento.data = data;
    if (horario) agendamento.horario = horario;
    if (telefone) agendamento.telefone = telefone;
    if (valor != null) agendamento.valor = valor;
    if (observacoes != null) agendamento.observacoes = observacoes;

    await agendamento.save();
    res.json({ message: 'Agendamento atualizado com sucesso', agendamento: serializeAgendamento(agendamento) });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ message: 'Erro ao atualizar agendamento' });
  }
});

app.put('/agendamentos/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = await Agendamento.findByPk(id);
    if (!agendamento) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }
    agendamento.canceled = true;
    agendamento.status = 'cancelado';
    await agendamento.save();
    res.json({ message: 'Agendamento cancelado com sucesso', agendamento: serializeAgendamento(agendamento) });
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({ message: 'Erro ao cancelar agendamento' });
  }
});

app.put('/agendamentos/:id/faturar', async (req, res) => {
  try {
    const { id } = req.params;
    const { valor, forma_pagamento } = req.body;
    const agendamento = await Agendamento.findByPk(id);
    if (!agendamento) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }
    if (!valor || !forma_pagamento) {
      return res.status(400).json({ message: 'Valor e forma de pagamento são obrigatórios' });
    }
    agendamento.faturado = true;
    agendamento.valor = valor;
    agendamento.forma_pagamento = forma_pagamento;
    await agendamento.save();
    res.json({ message: 'Agendamento faturado com sucesso', agendamento: serializeAgendamento(agendamento) });
  } catch (error) {
    console.error('Erro ao faturar agendamento:', error);
    res.status(500).json({ message: 'Erro ao faturar agendamento' });
  }
});

app.get('/faturamento/semana', async (req, res) => {
  try {
    const hoje = new Date();
    const seteDias = new Date();
    seteDias.setDate(hoje.getDate() + 7);

    const faturamentos = await Agendamento.findAll({
      where: {
        faturado: true,
        data: {
          [Op.between]: [hoje.toISOString().split('T')[0], seteDias.toISOString().split('T')[0]]
        }
      }
    });

    const total = faturamentos.reduce((sum, item) => sum + parseFloat(item.valor), 0);
    res.json({ total: total.toFixed(2), count: faturamentos.length });
  } catch (error) {
    console.error('Erro ao buscar faturamento da semana:', error);
    res.status(500).json({ message: 'Erro ao buscar faturamento da semana' });
  }
});

app.get('/faturamento/mes', async (req, res) => {
  try {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const faturamentos = await Agendamento.findAll({
      where: {
        faturado: true,
        data: {
          [Op.between]: [primeiroDia.toISOString().split('T')[0], ultimoDia.toISOString().split('T')[0]]
        }
      }
    });

    const total = faturamentos.reduce((sum, item) => sum + parseFloat(item.valor), 0);
    res.json({ total: total.toFixed(2), count: faturamentos.length });
  } catch (error) {
    console.error('Erro ao buscar faturamento do mês:', error);
    res.status(500).json({ message: 'Erro ao buscar faturamento do mês' });
  }
});

sequelize
  .sync({ alter: true })
  .then(async () => {
    await Usuario.findOrCreate({
      where: { email: 'barbeiro@agendafacil.com' },
      defaults: {
        nome: 'Administrador Barbearia',
        email: 'barbeiro@agendafacil.com',
        telefone: '(00) 00000-0000',
        cpf: '000.000.000-00',
        data_nascimento: '1980-01-01',
        senha: 'barbeiro123',
        role: 'barbeiro'
      }
    });

    await Usuario.findOrCreate({
      where: { email: 'cliente@agendafacil.com' },
      defaults: {
        nome: 'Cliente Teste',
        email: 'cliente@agendafacil.com',
        telefone: '(00) 00000-0000',
        cpf: '111.111.111-11',
        data_nascimento: '1990-01-01',
        senha: 'cliente123',
        role: 'cliente'
      }
    });

    app.listen(port, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${port}`);
      console.log('✅ Banco de dados sincronizado.');
    });
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar ou sincronizar com o banco de dados:', error);
  });