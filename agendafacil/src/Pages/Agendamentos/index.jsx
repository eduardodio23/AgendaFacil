import { useEffect, useMemo, useState } from 'react';
import './style.css';
import { useAuth } from '../../contexts/AuthContext';
import { baseUrl } from '../../api';

const servicosDisponiveis = [
  { id: 1, nome: 'Corte Masculino', duracao: 30, preco: 25 },
  { id: 2, nome: 'Corte + Barba', duracao: 60, preco: 30 },
  { id: 3, nome: 'Barba Modelada', duracao: 30, preco: 20 },
  { id: 4, nome: 'Sobrancelha', duracao: 15, preco: 15 },
  { id: 5, nome: 'Luzes / Coloração', duracao: 90, preco: 80 },
];

const profissionaisDisponiveis = [
  { id: 1, nome: 'Ramon (Proprietário)' },
];

const horariosDiaUtil = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30',
];

const horariosSabado = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];

const horariosDomingo = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00',
];

function getHorariosDisponiveis(data) {
  if (!data) return horariosDiaUtil;
  const dia = new Date(`${data}T12:00:00`).getDay();
  if (dia === 6) return horariosSabado;
  if (dia === 0) return horariosDomingo;
  return horariosDiaUtil;
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export default function Agendamentos() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    servico: '',
    profissional: '',
    data: '',
    horario: '',
    telefone: '',
    observacoes: ''
  });
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [extra, setExtra] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        telefone: user.telefone || prev.telefone
      }));
    }
  }, [user]);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!formData.profissional || !formData.data) {
        setAvailability(null);
        return;
      }

      setLoadingAvailability(true);
      try {
        const response = await fetch(`${baseUrl}/agendamentos/disponibilidade?profissional=${encodeURIComponent(profissionaisDisponiveis.find((p) => String(p.id) === formData.profissional)?.nome || '')}&data=${formData.data}`);
        if (!response.ok) {
          throw new Error('Não foi possível carregar a disponibilidade');
        }
        const data = await response.json();
        setAvailability(data);
      } catch (err) {
        setAvailability(null);
      } finally {
        setLoadingAvailability(false);
      }
    };

    loadAvailability();
  }, [formData.profissional, formData.data]);

  const availableSlots = useMemo(() => {
    if (!availability) {
      return getHorariosDisponiveis(formData.data);
    }

    return availability.availableSlots;
  }, [availability, formData.data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = name === 'telefone' ? formatPhone(value) : value;

    setFormData((prev) => {
      const updatedForm = {
        ...prev,
        [name]: formattedValue
      };

      if (name === 'data') {
        const horariosParaData = getHorariosDisponiveis(formattedValue);
        if (!horariosParaData.includes(prev.horario)) {
          updatedForm.horario = '';
        }
      }

      return updatedForm;
    });

    if (name === 'servico') {
      const servico = servicosDisponiveis.find((s) => s.id === parseInt(value, 10));
      setServicoSelecionado(servico || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.servico || !formData.profissional || !formData.data || !formData.horario || !formData.telefone) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      const selectedService = servicosDisponiveis.find((s) => s.id === parseInt(formData.servico, 10));
      const response = await fetch(`${baseUrl}/agendamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: user.id,
          servico: selectedService?.nome,
          profissional: profissionaisDisponiveis.find((p) => p.id === parseInt(formData.profissional, 10))?.nome,
          data: formData.data,
          horario: formData.horario,
          telefone: formData.telefone,
          valor: selectedService?.preco || 0,
          observacoes: formData.observacoes,
          extra
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Erro ao enviar agendamento.');
        return;
      }

      setShowModal(true);
      setFormData((prev) => ({
        ...prev,
        servico: '',
        profissional: '',
        data: '',
        horario: '',
        observacoes: ''
      }));
      setServicoSelecionado(null);
      setExtra(false);
    } catch (err) {
      setError('Erro de conexão com a API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agendamentos-container">
      <div className="agendamentos-box">
        <h1>Agendamento</h1>
        <p className="agendamentos-subtitle">Agende em poucos passos e acompanhe sua visita pelo celular.</p>

        <form onSubmit={handleSubmit} className="agendamentos-form">
          <div className="form-section">
            <h2>Selecione o Serviço *</h2>
            <div className="servicos-grid">
              {servicosDisponiveis.map((servico) => (
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

          <div className="form-section">
            <h2>Selecione o Profissional *</h2>
            <div className="profissionais-grid">
              {profissionaisDisponiveis.map((prof) => (
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
                  {availableSlots.map((horario) => (
                    <option key={horario} value={horario}>{horario}</option>
                  ))}
                </select>
              </div>
            </div>

            {loadingAvailability ? (
              <p className="helper-text">Buscando horários disponíveis...</p>
            ) : availability ? (
              <div className="availability-card">
                <p>Horários livres: {availability.availableSlots.length}</p>
                {availability.extraSlots.length > 0 && <p>Extras confirmados: {availability.extraSlots.join(', ')}</p>}
              </div>
            ) : null}

            <label className="checkbox-card">
              <input type="checkbox" checked={extra} onChange={() => setExtra((prev) => !prev)} />
              <span>Quero registrar este atendimento como extra, mesmo que o horário esteja ocupado.</span>
            </label>
          </div>

          <div className="form-section">
            <h2>Seus Dados</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  required
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

          {servicoSelecionado && formData.data && formData.horario && (
            <div className="agendamento-resumo">
              <h3>Resumo do Agendamento</h3>
              <p><strong>Serviço:</strong> {servicoSelecionado.nome}</p>
              <p><strong>Duração:</strong> {servicoSelecionado.duracao} minutos</p>
              <p><strong>Valor:</strong> R$ {servicoSelecionado.preco},00</p>
              <p><strong>Data:</strong> {formData.data}</p>
              <p><strong>Horário:</strong> {formData.horario}</p>
              <p><strong>Tipo:</strong> {extra ? 'Extra' : 'Confirmado'}</p>
            </div>
          )}

          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Confirmar Agendamento'}
          </button>
        </form>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Agendamento concluído</h3>
            <p>Seu agendamento foi enviado com sucesso. Veja o barbeiro na agenda da semana.</p>
            <button type="button" className="btn-submit" onClick={() => setShowModal(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
