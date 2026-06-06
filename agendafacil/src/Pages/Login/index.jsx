import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { baseUrl } from '../../api';
import './style.css';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate(user.role === 'barbeiro' ? '/barbeiro' : '/paginaprincipal');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Falha ao autenticar.');
        return;
      }

      login(data.usuario);
      navigate(data.usuario.role === 'barbeiro' ? '/barbeiro' : '/paginaprincipal');
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    }
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (resetEmail) {
      alert('Um link de recuperação foi enviado para ' + resetEmail);
      setResetEmail('');
      setIsPasswordReset(false);
    } else {
      setError('Por favor, digite seu email.');
    }
  };

  return (
    <div className="login-container">
      {!isPasswordReset ? (
        <div className="login-box">
          <h1>Login</h1>
          <p className="login-subtitle">Acesse sua conta</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="btn-submit">Entrar</button>
          </form>

          <div className="login-footer">
            <button
              type="button"
              className="forgot-password-btn"
              onClick={() => {
                setIsPasswordReset(true);
                setError('');
              }}
            >
              Esqueci minha senha
            </button>
            <p>
              Não tem conta? <Link to="/cadastro">Cadastre-se aqui</Link>
            </p>
          </div>
        </div>
      ) : (
        <div className="login-box">
          <h1>Recuperar Senha</h1>
          <p className="login-subtitle">Digite seu email para receber um link de recuperação</p>

          <form onSubmit={handlePasswordReset} className="login-form">
            <div className="form-group">
              <label htmlFor="reset-email">Email</label>
              <input
                type="email"
                id="reset-email"
                name="reset-email"
                placeholder="seu@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-submit">Enviar Link de Recuperação</button>
          </form>

          <div className="login-footer">
            <button
              type="button"
              className="forgot-password-btn"
              onClick={() => {
                setIsPasswordReset(false);
                setError('');
              }}
            >
              Voltar ao Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
