import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { baseUrl } from '../../api';
import './style.css';

const servicosDisponiveis = [
  { id: 1, nome: 'Corte Masculino', duracao: 30, preco: 25 },
  { id: 2, nome: 'Corte + Barba', duracao: 60, preco: 30 },
  { id: 3, nome: 'Barba Modelada', duracao: 30, preco: 20 },
  { id: 4, nome: 'Sobrancelha', duracao: 15, preco: 15 },
  { id: 5, nome: 'Luzes / Coloração', duracao: 90, preco: 80 },
];

export default function MeusAgendamentos() {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ servico: '', observacoes: '' });
  const [saving, setSaving] = useState(false);

  async function loadAgendamentos() {
    try {
      const response = await fetch(`${baseUrl}/agendamentos/usuario/${user.id}`);
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

  useEffect(() => {
    if (user) {
      loadAgendamentos();
    }
  }, [user]);

  const startEditing = (item) => {
    setEditingId(item.id);
    setDraft({ servico: item.servico, observacoes: item.observacoes || '' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraft({ servico: '', observacoes: '' });
  };

  const saveEdit = async (id) => {
    try {
      setSaving(true);
      const response = await fetch(`${baseUrl}/agendamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servico: draft.servico,
          observacoes: draft.observacoes
        })
      });

      if (!response.ok) {
        throw new Error('Não foi possível atualizar o agendamento');
      }

      await loadAgendamentos();
      cancelEditing();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      setSaving(true);
      const response = await fetch(`${baseUrl}/agendamentos/${id}/cancel`, { method: 'PUT' });
      if (!response.ok) {
        throw new Error('Não foi possível cancelar o agendamento');
      }
      await loadAgendamentos();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="meus-agendamentos-container">
      <div className="meus-agendamentos-box">
        <h1>Meus Agendamentos</h1>
        <p>Gerencie seus atendimentos com praticidade pelo celular.</p>

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
                <p><strong>Profissional:</strong> {item.profissional}</p>
                <p><strong>Valor:</strong> R$ {Number(item.valor).toFixed(2)}</p>
                <p><strong>Status:</strong> {item.canceled ? 'Cancelado' : item.extra ? 'Extra' : 'Agendado'}</p>

                {editingId === item.id ? (
                  <div className="edit-card">
                    <label className="edit-label">Serviço</label>
                    <select value={draft.servico} onChange={(e) => setDraft((prev) => ({ ...prev, servico: e.target.value }))}>
                      <option value="">Selecione</option>
                      {servicosDisponiveis.map((servico) => (
                        <option key={servico.id} value={servico.nome}>{servico.nome}</option>
                      ))}
                    </select>

                    <label className="edit-label">Observações</label>
                    <textarea
                      rows={3}
                      value={draft.observacoes}
                      onChange={(e) => setDraft((prev) => ({ ...prev, observacoes: e.target.value }))}
                    />

                    <div className="card-actions">
                      <button className="btn-secondary" onClick={cancelEditing} disabled={saving}>Cancelar</button>
                      <button className="btn-submit small" onClick={() => saveEdit(item.id)} disabled={saving}>Salvar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p><strong>Serviço:</strong> {item.servico}</p>
                    <p><strong>Observações:</strong> {item.observacoes || 'Sem observações'}</p>
                    <div className="card-actions">
                      <button className="btn-secondary" onClick={() => startEditing(item)} disabled={item.canceled || saving}>Editar</button>
                      <button className="btn-submit small" onClick={() => cancelAppointment(item.id)} disabled={item.canceled || saving}>Cancelar</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
