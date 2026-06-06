const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes, Op } = require('sequelize');

const sequelize = new Sequelize('agendafacil', 'root', '', {
  host: 'localhost',
  password: '',
  dialect: 'mysql'
});

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
  }
});

Usuario.hasMany(Agendamento, { foreignKey: 'usuarioId' });
Agendamento.belongsTo(Usuario, { foreignKey: 'usuarioId' });

const app = express();
app.use(cors());
app.use(express.json());

const port = 3000;

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

app.get('/agendamentos', async (req, res) => {
  try {
    const agendamentos = await Agendamento.findAll({
      include: [{ model: Usuario, attributes: ['id', 'nome', 'email', 'telefone'] }],
      order: [['data', 'ASC'], ['horario', 'ASC']]
    });
    res.json(agendamentos);
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
    res.json(agendamentosDaSemana);
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
    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos do usuário' });
  }
});

app.post('/agendamentos', async (req, res) => {
  try {
    const { usuarioId, servico, profissional, data, horario, telefone, valor, observacoes } = req.body;

    if (!usuarioId || !servico || !profissional || !data || !horario || !telefone || valor == null) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' });
    }

    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
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
      faturado: false
    });

    res.status(201).json({ message: 'Agendamento criado com sucesso', agendamento: novoAgendamento });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ message: 'Erro ao criar agendamento' });
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
    await agendamento.save();
    res.json({ message: 'Agendamento cancelado com sucesso', agendamento });
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
    res.json({ message: 'Agendamento faturado com sucesso', agendamento });
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