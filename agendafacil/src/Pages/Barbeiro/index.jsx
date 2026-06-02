import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './style.css';

const paymentMethods = [
  { value: 'Dinheiro', label: 'Dinheiro' },
  { value: 'Cartão', label: 'Cartão' },
  { value: 'Pix', label: 'Pix' },
  { value: 'Transferência', label: 'Transferência' }
];

export default function Barbeiro() {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loadingAgenda, setLoadingAgenda] = useState(true);
  const [loadingFinance, setLoadingFinance] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [billingData, setBillingData] = useState({});
  const [selectedTab, setSelectedTab] = useState('agenda');
  const [faturamentoSemana, setFaturamentoSemana] = useState(null);
  const [faturamentoMes, setFaturamentoMes] = useState(null);

  const loadAgendamentos = async () => {
    setLoadingAgenda(true);
    try {
      const response = await fetch('http://localhost:3000/agendamentos/semana');
      if (!response.ok) {
        throw new Error('Não foi possível carregar os agendamentos');
      }
      const data = await response.json();
      setAgendamentos(data);
      const initialBilling = data.reduce((acc, item) => {
        acc[item.id] = {
          valor: item.valor ? Number(item.valor).toFixed(2) : '0.00',
          forma_pagamento: item.forma_pagamento || 'Dinheiro'
        };
        return acc;
      }, {});
      setBillingData(initialBilling);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAgenda(false);
    }
  };

  const loadFinance = async () => {
    setLoadingFinance(true);
    try {
      const [weekResponse, monthResponse] = await Promise.all([
        fetch('http://localhost:3000/faturamento/semana'),
        fetch('http://localhost:3000/faturamento/mes')
      ]);
      if (!weekResponse.ok || !monthResponse.ok) {
        throw new Error('Não foi possível carregar o faturamento');
      }
      const weekData = await weekResponse.json();
      const monthData = await monthResponse.json();
      setFaturamentoSemana(weekData);
      setFaturamentoMes(monthData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingFinance(false);
    }
  };

  useEffect(() => {
    loadAgendamentos();
    loadFinance();
  }, []);

  const handleCancel = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/agendamentos/${id}/cancel`, {
        method: 'PUT'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao cancelar agendamento');
      }
      setActionMessage('Agendamento cancelado com sucesso.');
      loadAgendamentos();
      loadFinance();
    } catch (err) {
      setActionMessage(err.message);
    }
  };

  const handleBillingChange = (id, field, value) => {
    setBillingData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleFaturar = async (id) => {
    const billing = billingData[id] || {};
    if (!billing.valor || !billing.forma_pagamento) {
      setActionMessage('Informe valor e forma de pagamento para faturar.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/agendamentos/${id}/faturar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: parseFloat(billing.valor),
          forma_pagamento: billing.forma_pagamento
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao faturar agendamento');
      }
      setActionMessage('Agendamento faturado com sucesso.');
      loadAgendamentos();
      loadFinance();
    } catch (err) {
      setActionMessage(err.message);
    }
  };

  return (
    <section className="barbeiro-dashboard">
      <header className="barbeiro-header">
        <div>
          <h1>Painel do Barbeiro</h1>
          <p>Olá, {user?.nome}. Aqui estão os agendamentos e o faturamento desta semana.</p>
        </div>
      </header>

      <div className="barbeiro-tabs">
        <button type="button" className={selectedTab === 'agenda' ? 'active' : ''} onClick={() => setSelectedTab('agenda')}>
          Agenda
        </button>
        <button type="button" className={selectedTab === 'faturamento' ? 'active' : ''} onClick={() => setSelectedTab('faturamento')}>
          Faturamento
        </button>
      </div>

      {actionMessage && <p className="action-message">{actionMessage}</p>}

      {selectedTab === 'faturamento' ? (
        <div className="barbeiro-finance">
          <div className="finance-card">
            <h3>Faturamento da Semana</h3>
            {loadingFinance ? (
              <p>Carregando...</p>
            ) : (
              <>
                <p>Total: R$ {faturamentoSemana?.total || '0.00'}</p>
                <p>Atendimentos faturados: {faturamentoSemana?.count || 0}</p>
              </>
            )}
          </div>
          <div className="finance-card">
            <h3>Faturamento do Mês</h3>
            {loadingFinance ? (
              <p>Carregando...</p>
            ) : (
              <>
                <p>Total: R$ {faturamentoMes?.total || '0.00'}</p>
                <p>Atendimentos faturados: {faturamentoMes?.count || 0}</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="barbeiro-summary">
            <div>
              <strong>Agendamentos</strong>
              <span>{agendamentos.length}</span>
            </div>
            <div>
              <strong>Cancelamentos</strong>
              <span>{agendamentos.filter((item) => item.canceled).length}</span>
            </div>
            <div>
              <strong>Faturados</strong>
              <span>{agendamentos.filter((item) => item.faturado).length}</span>
            </div>
          </div>

          {loadingAgenda ? (
            <p className="loading-text">Carregando agenda...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : agendamentos.length === 0 ? (
            <p className="empty-text">Nenhum agendamento encontrado para esta semana.</p>
          ) : (
            <div className="barbeiro-cards">
              {agendamentos.map((agendamento) => (
                <article key={agendamento.id} className={`barbeiro-card ${agendamento.canceled ? 'canceled' : ''}`}>
                  <div className="barbeiro-card-top">
                    <span className="card-date">{new Date(agendamento.data).toLocaleDateString('pt-BR')}</span>
                    <span className="card-time">{agendamento.horario}</span>
                  </div>
                  <h2>{agendamento.servico}</h2>
                  <p><strong>Cliente:</strong> {agendamento.Usuario?.nome || 'Cliente não encontrado'}</p>
                  <p><strong>Telefone:</strong> {agendamento.telefone}</p>
                  <p><strong>Tipo de corte:</strong> {agendamento.servico}</p>
                  <p><strong>Profissional:</strong> {agendamento.profissional}</p>
                  <p><strong>Valor:</strong> R$ {Number(agendamento.valor || 0).toFixed(2)}</p>
                  <p className="observacoes"><strong>Observações:</strong> {agendamento.observacoes || 'Sem observações'}</p>
                  <p><strong>Status:</strong> {agendamento.canceled ? 'Cancelado' : agendamento.faturado ? 'Faturado' : 'Aberto'}</p>
                  {agendamento.faturado && (
                    <p><strong>Pagamento:</strong> {agendamento.forma_pagamento || 'Não informado'}</p>
                  )}
                  {agendamento.canceled && (
                    <p className="cancel-warning">Aviso de cancelamento: este agendamento foi cancelado.</p>
                  )}

                  {!agendamento.canceled && (
                    <div className="barbeiro-actions">
                      <button type="button" className="cancel-button" onClick={() => handleCancel(agendamento.id)}>
                        Cancelar
                      </button>
                      {!agendamento.faturado && (
                        <div className="billing-box">
                          <label>
                            Valor
                            <input
                              type="number"
                              step="0.01"
                              value={billingData[agendamento.id]?.valor || ''}
                              onChange={(e) => handleBillingChange(agendamento.id, 'valor', e.target.value)}
                            />
                          </label>
                          <label>
                            Forma de Pagamento
                            <select
                              value={billingData[agendamento.id]?.forma_pagamento || 'Dinheiro'}
                              onChange={(e) => handleBillingChange(agendamento.id, 'forma_pagamento', e.target.value)}
                            >
                              {paymentMethods.map((method) => (
                                <option key={method.value} value={method.value}>{method.label}</option>
                              ))}
                            </select>
                          </label>
                          <button type="button" className="faturar-button" onClick={() => handleFaturar(agendamento.id)}>
                            Faturar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
