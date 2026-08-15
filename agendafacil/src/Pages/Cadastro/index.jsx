import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { baseUrl } from '../../api';
import './style.css';

// Lista de domínios de email permitidos
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'yahoo.com',
  'mail.com', 'protonmail.com', 'aol.com', 'terra.com.br', 'uol.com.br',
  'ig.com.br', 'globo.com', 'live.com', 'msn.com', 'ymail.com'
];

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function formatCPF(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function isValidEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain && ALLOWED_EMAIL_DOMAINS.includes(domain);
}

function isValidMonth(dateString) {
  if (!dateString) return true;
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  return month <= 12;
}

export default function Cadastro() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    senha: '',
    confirmarSenha: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'telefone') {
      newValue = formatPhone(value);
    }

    if (name === 'cpf') {
      newValue = formatCPF(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações no frontend
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    if (formData.senha.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres.');
      return;
    }

    // Validar email
    if (formData.email && !isValidEmail(formData.email)) {
      setError('Por favor, use um email de uma empresa conhecida (Gmail, Hotmail, Outlook, iCloud, Yahoo, etc.)');
      return;
    }

    // Validar mês
    if (formData.dataNascimento && !isValidMonth(formData.dataNascimento)) {
      setError('Data de nascimento inválida.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          cpf: formData.cpf,
          data_nascimento: formData.dataNascimento,
          senha: formData.senha
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Erro ao cadastrar usuário.');
        return;
      }

      setShowModal(true);
    } catch (err) {
      setError('Erro de conexão com a API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-box">
        <h1>Cadastro de Cliente</h1>
        <p className="cadastro-subtitle">Preencha os dados abaixo para criar sua conta</p>

        <form onSubmit={handleSubmit} className="cadastro-form">
          <div className="form-group">
            <label htmlFor="nome">Nome Completo *</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder="Digite seu nome completo"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">E-mail *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefone">Telefone *</label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                required
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cpf">CPF *</label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dataNascimento">Data de Nascimento</label>
              <input
                type="date"
                id="dataNascimento"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="senha">Senha *</label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmarSenha">Confirmar Senha *</label>
              <input
                type="password"
                id="confirmarSenha"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
                placeholder="Repita sua senha"
              />
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          <p className="form-footer">
            Já tem conta? <Link to="/login">Fazer login</Link>
          </p>
        </form>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cadastro concluído</h3>
            <p>Seu usuário foi criado com sucesso. Agora você pode entrar na sua conta.</p>
            <button type="button" className="btn-submit" onClick={() => navigate('/login')}>
              Ir para Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
