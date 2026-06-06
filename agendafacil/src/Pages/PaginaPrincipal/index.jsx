import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { baseUrl } from '../../api';
import './style.css';

export default function PaginaPrincipal() {
  const { user } = useAuth();
  const isBarbeiro = user?.role === 'barbeiro';
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!user || isBarbeiro) return;
      try {
        const response = await fetch(`${baseUrl}/agendamentos/usuario/${user.id}`);
        if (!response.ok) {
          throw new Error('Erro ao carregar seus agendamentos');
        }
        const data = await response.json();
        setAgendamentos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, isBarbeiro]);

  return (
    <div className="PaginaPrincipal">
      <section className="hero">
        <h1>Bem-vindo à Barbearia Ramon</h1>
        <p>{isBarbeiro ? 'Confira os agendamentos da semana e mantenha a agenda atualizada.' : 'Faça o seu agendamento e não seja surpreendido por filas!'}</p>
        <Link to={isBarbeiro ? '/barbeiro' : '/agendamentos'} className="cta-button">
          {isBarbeiro ? 'Ver Agenda do Barbeiro' : 'Realizar Agendamento'}
        </Link>
      </section>
      <section className="featured">
        <h2>Horários de Funcionamento</h2>
        <div className="products-grid">
          <div className="products-card">
            <ul>
              <li><strong>Segunda a Sexta:</strong> 08:00 às 23:00</li>
              <li><strong>Sábado:</strong> 08:00 às 18:00</li>
              <li><strong>Domingo:</strong> 08:00 às 13:00</li>
            </ul>
          </div>
        </div>
      </section>
      {!isBarbeiro && (
        <section className="quick-access">
          <div className="quick-access-card">
            <div className="quick-access-header">
              <div>
                <h3>Meus agendamentos</h3>
                <p>Acesse rapidamente seus horários e dias agendados.</p>
              </div>
              <Link to="/meus-agendamentos" className="small-link">Ver todos</Link>
            </div>

            {loading ? (
              <p className="quick-loading">Carregando agendamentos...</p>
            ) : error ? (
              <p className="quick-error">{error}</p>
            ) : agendamentos.length === 0 ? (
              <p className="quick-empty">Nenhum agendamento encontrado.</p>
            ) : (
              <div className="quick-list">
                {agendamentos.slice(0, 3).map((item) => (
                  <div key={item.id} className="quick-item">
                    <div>
                      <strong>{new Date(item.data).toLocaleDateString('pt-BR')}</strong>
                      <span>{item.horario}</span>
                    </div>
                    <p>{item.servico}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
