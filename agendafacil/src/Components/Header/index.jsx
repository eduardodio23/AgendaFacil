import { NavLink } from 'react-router-dom';
import './style.css';

export default function Header() {
    return(
        <header>
            <div className="logo">
                <span className="logo-icon">✂</span>
                <span className="logo-text">Barbearia Ramon</span>
            </div>
            <nav>
                <ul>
                    <li><NavLink to="/">Início</NavLink></li>
                    <li><NavLink to="/agendamentos">Agendamentos</NavLink></li>
                    <li><NavLink to="/sobrenos">Sobre Nós</NavLink></li>
                </ul>
            </nav>
        </header>
    )
}