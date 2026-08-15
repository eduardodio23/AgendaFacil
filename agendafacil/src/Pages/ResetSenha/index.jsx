import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { baseUrl } from '../../api';
import './style.css';

export default function ResetSenha() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    novaSenha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);

  // Validar token ao carregar a página
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`${baseUrl}/validar-reset-token/${token}`);
        if (response.ok) {
          setTokenValid(true);
        } else {
          setError('Link inválido ou expirado. Por favor, solicite um novo reset de senha.');
        }
      } catch (err) {
        setError('Erro ao validar link. Por favor, tente novamente.');
      } finally {
        setValidating(false);
      }
    };

    if (token) {
      validateToken();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!formData.novaSenha || !formData.confirmarSenha) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (formData.novaSenha.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (formData.novaSenha !== formData.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/resetar-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          novaSenha: formData.novaSenha,
          confirmarSenha: formData.confirmarSenha
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Erro ao resetar senha.');
        return;
      }

      // Redirecionar para login após sucesso
      alert('Senha alterada com sucesso! Você pode fazer login agora.');
      navigate('/login');
    } catch (err) {
      setError('Erro de conexão com a API.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="reset-senha-container">
        <div className="reset-senha-box">
          <h1>Validando link...</h1>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="reset-senha-container">
        <div className="reset-senha-box">
          <h1>Link Inválido</h1>
          <div className="error-message">{error}</div>
          <Link to="/esqueci-senha" className="btn-submit" style={{ textAlign: 'center', display: 'block' }}>
            Solicitar novo reset
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-senha-container">
      <div className="reset-senha-box">
        <h1>Resetar Senha</h1>
        <p className="subtitle">
          Digite sua nova senha abaixo
        </p>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="novaSenha">Nova Senha *</label>
            <input
              type="password"
              id="novaSenha"
              name="novaSenha"
              value={formData.novaSenha}
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
              placeholder="Repita a senha"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Alterando Senha...' : 'Alterar Senha'}
          </button>

          <p className="form-footer">
            Voltar para <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
