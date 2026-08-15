import { useState } from 'react';
import { Link } from 'react-router-dom';
import { baseUrl } from '../../api';
import './style.css';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Por favor, insira seu email.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/esqueci-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Erro ao processar solicitação.');
        return;
      }

      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Erro de conexão com a API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="esqueci-senha-container">
      <div className="esqueci-senha-box">
        <h1>Esqueci Minha Senha</h1>
        <p className="subtitle">
          Insira seu email para receber um link de reset de senha
        </p>

        {success ? (
          <div className="success-message">
            <h3>Email enviado com sucesso!</h3>
            <p>
              Se o email existe em nossa base de dados, você receberá um link para resetar sua senha.
            </p>
            <p>Por favor, verifique sua caixa de entrada e pasta de spam.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Link de Reset'}
            </button>

            <p className="form-footer">
              Voltar para <Link to="/login">Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
