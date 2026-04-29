import './style.css'; 

export default function Footer() {
    return(
        <footer>
            <div className="footer-content">
                <div className="footer-logo">
                    <span className="logo-icon">✂</span>
                    <span>Barbearia Ramon</span>
                </div>
                <p className="footer-info">
                    CNPJ 00.000.000/0000-00 • Rua Travessa do Riberio 84, Cidade Baixa, Salvador - BA
                </p>
                <p className="footer-copy">
                    © {new Date().getFullYear()} Barbearia Ramon. Todos os direitos reservados.
                </p>
            </div>
        </footer>
    )
}