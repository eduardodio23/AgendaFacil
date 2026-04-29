import { useState } from 'react';
import './style.css';

// Dados de exemplo - futuramente virão do banco de dados
const servicosDisponiveis = [
  { id: 1, nome: 'Corte Masculino', duracao: 30, preco: 35 },
  { id: 2, nome: 'Corte + Barba', duracao: 60, preco: 55 },
  { id: 3, nome: 'Barba Modelada', duracao: 30, preco: 25 },
  { id: 4, nome: 'Sobrancelha', duracao: 15, preco: 15 },
  { id: 5, nome: 'Luzes / Coloração', duracao: 90, preco: 80 },
  { id: 6, nome: 'Relaxamento', duracao: 45, preco: 45 },
];

const profissionaisDisponiveis = [
  { id: 1, nome: 'Ramon (Proprietário)' },
];

// Horários disponíveis
const horariosDisponiveis = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30',
];

export default function Agendamentos() {
  const [formData, setFormData] = useState({
    servico: '',
    profissional: '',
    data: '',
    horario: '',
    nomeCliente: '',
    telefone: '',
    observacoes: ''
  });

  const [servicoSelecionado, setServicoSelecionado] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Atualiza o serviço selecionado para mostrar duração e preço
    if (name === 'servico') {
      const servico = servicosDisponiveis.find(s => s.id === parseInt(value));
      setServicoSelecionado(servico || null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação básica
    if (!formData.servico || !formData.profissional || !formData.data || !formData.horario) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    // TODO: Enviar dados para o banco de dados
    const agendamento = {
      servico_id: parseInt(formData.servico),
      profissional_id: parseInt(formData.profissional),
      data: formData.data,
      horario: formData.horario,
      cliente: {
        nome: formData.nomeCliente,
        telefone: formData.telefone
      },
      observacoes: formData.observacoes,
    };

    console.log('Agendamento pronto para envio ao banco:', agendamento);
    alert('Agendamento realizado com sucesso! (Pronto para integração com banco)');
  };

  return (
    <div className="agendamentos-container">
      <div className="agendamentos-box">
        <h1>Agendamento</h1>
        <p className="agendamentos-subtitle">Escolha o serviço, profissional e horário</p>

        <form onSubmit={handleSubmit} className="agendamentos-form">
          {/* Seção: Serviço */}
          <div className="form-section">
            <h2>Selecione o Serviço *</h2>
            <div className="servicos-grid">
              {servicosDisponiveis.map(servico => (
                <label 
                  key={servico.id} 
                  className={`servico-card ${formData.servico === String(servico.id) ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="servico"
                    value={servico.id}
                    checked={formData.servico === String(servico.id)}
                    onChange={handleChange}
                    required
                  />
                  <div className="servico-info">
                    <span className="servico-nome">{servico.nome}</span>
                    <span className="servico-detalhes">
                      {servico.duracao} min • R$ {servico.preco},00
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Seção: Profissional */}
          <div className="form-section">
            <h2>Selecione o Profissional *</h2>
            <div className="profissionais-grid">
              {profissionaisDisponiveis.map(prof => (
                <label 
                  key={prof.id} 
                  className={`profissional-card ${formData.profissional === String(prof.id) ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="profissional"
                    value={prof.id}
                    checked={formData.profissional === String(prof.id)}
                    onChange={handleChange}
                    required
                  />
                  <span className="profissional-nome">{prof.nome}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Seção: Data e Horário */}
          <div className="form-section">
            <h2>Data e Horário *</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="data">Data</label>
                <input
                  type="date"
                  id="data"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label htmlFor="horario">Horário</label>
                <select
                  id="horario"
                  name="horario"
                  value={formData.horario}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione um horário</option>
                  {horariosDisponiveis.map(horario => (
                    <option key={horario} value={horario}>{horario}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Seção: Dados do Cliente */}
          <div className="form-section">
            <h2>Seus Dados</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nomeCliente">Nome Completo</label>
                <input
                  type="text"
                  id="nomeCliente"
                  name="nomeCliente"
                  value={formData.nomeCliente}
                  onChange={handleChange}
                  placeholder="Seu nome"
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="observacoes">Observações (opcional)</label>
              <textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                placeholder="Alguma informação adicional para o agendamento?"
                rows={3}
              />
            </div>
          </div>

          {/* Resumo do Agendamento */}
          {servicoSelecionado && formData.data && formData.horario && (
            <div className="agendamento-resumo">
              <h3>Resumo do Agendamento</h3>
              <p><strong>Serviço:</strong> {servicoSelecionado.nome}</p>
              <p><strong>Duração:</strong> {servicoSelecionado.duracao} minutos</p>
              <p><strong>Valor:</strong> R$ {servicoSelecionado.preco},00</p>
              <p><strong>Data:</strong> {formData.data}</p>
              <p><strong>Horário:</strong> {formData.horario}</p>
            </div>
          )}

          <button type="submit" className="btn-submit">
            Confirmar Agendamento
          </button>
        </form>
      </div>
    </div>
  );
}