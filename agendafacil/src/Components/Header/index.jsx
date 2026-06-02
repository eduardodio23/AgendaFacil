import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './style.css';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header>
      <div className="logo">
        <span className="logo-icon">✂</span>
        <span className="logo-text">Barbearia Ramon</span>
      </div>
      <nav>
        <ul>
          {user ? (
            <>
              <li>
                <NavLink to="/paginaprincipal">Início</NavLink>
              </li>
              <li>
                <NavLink to="/agendamentos">Agendamentos</NavLink>
              </li>
              {user.role !== 'barbeiro' && (
                <li>
                  <NavLink to="/meus-agendamentos">Meus Agendamentos</NavLink>
                </li>
              )}
              {user.role === 'barbeiro' && (
                <li>
                  <NavLink to="/barbeiro">Barbeiro</NavLink>
                </li>
              )}
              <li>
                <NavLink to="/sobrenos">Sobre Nós</NavLink>
              </li>
              <li>
                <button type="button" className="logout-button" onClick={handleLogout}>
                  Sair
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/login">Login</NavLink>
              </li>
              <li>
                <NavLink to="/cadastro">Cadastro</NavLink>
              </li>
              <li>
                <NavLink to="/sobrenos">Sobre Nós</NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}