import { useState } from 'react';
import './style.css';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação básica
    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    // TODO: Enviar dados para o banco de dados
    // Estrutura pronta para conexão futura com API
    const dadosParaBanco = {
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      cpf: formData.cpf,
      data_nascimento: formData.dataNascimento,
    };

    console.log('Dados prontos para envio ao banco:', dadosParaBanco);
    alert('Cadastro realizado com sucesso! (Pronto para integração com banco)');
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

          <button type="submit" className="btn-submit">
            Cadastrar
          </button>

          <p className="form-footer">
            Já tem conta? <a href="/login">Fazer login</a>
          </p>
        </form>
      </div>
    </div>
  );
}