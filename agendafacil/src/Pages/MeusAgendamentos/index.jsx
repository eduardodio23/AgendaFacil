import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './style.css';

export default function MeusAgendamentos() {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAgendamentos() {
      try {
        const response = await fetch(`http://localhost:3000/agendamentos/usuario/${user.id}`);
        if (!response.ok) {
          throw new Error('Não foi possível carregar seus agendamentos');
        }
        const data = await response.json();
        setAgendamentos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadAgendamentos();
    }
  }, [user]);

  return (
    <div className="meus-agendamentos-container">
      <div className="meus-agendamentos-box">
        <h1>Meus Agendamentos</h1>
        <p>Veja todos os serviços que você agendou, com dia e horário.</p>

        {loading ? (
          <p className="loading-text">Carregando seus agendamentos...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : agendamentos.length === 0 ? (
          <p className="empty-text">Você ainda não tem agendamentos.</p>
        ) : (
          <div className="agenda-list">
            {agendamentos.map((item) => (
              <div key={item.id} className={`agenda-card ${item.canceled ? 'canceled' : ''}`}>
                <div className="agenda-card-header">
                  <span>{new Date(item.data).toLocaleDateString('pt-BR')}</span>
                  <span>{item.horario}</span>
                </div>
                <p><strong>Serviço:</strong> {item.servico}</p>
                <p><strong>Profissional:</strong> {item.profissional}</p>
                <p><strong>Valor:</strong> R$ {Number(item.valor).toFixed(2)}</p>
                <p><strong>Status:</strong> {item.canceled ? 'Cancelado' : item.faturado ? 'Faturado' : 'Agendado'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
