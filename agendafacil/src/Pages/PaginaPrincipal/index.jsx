import { Link } from 'react-router-dom';
import './style.css';


export default function PaginaPrincipal(){
    return(
        <div className="PaginaPrincipal">
            <section className="hero">
                <h1>Bem-vindo a Barbearia Ramon</h1>
                <p>Faça o seu agendamento e não seja supreendido por filas!</p>
                <Link to="/agendamentos" className="cta-button">Realizar Agendamentos</Link>
                
            </section>
            <section className="featured">
                <h2>Horarios de Funcionamento</h2>
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
        </div>
    )
}