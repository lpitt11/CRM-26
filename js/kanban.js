/**
 * IS CRM — kanban.js
 */
import { CRMState } from './app.js';
import { updateDashboardViews } from './dashboard.js';
import { openLeadDrawer } from './dashboard.js';

export function initKanban() {
    const columns = document.querySelectorAll('.kanban-column');

    columns.forEach(col => {
        col.addEventListener('dragover', (e) => {
            e.preventDefault();
            col.classList.add('drag-over');
        });

        col.addEventListener('dragleave', () => {
            col.classList.remove('drag-over');
        });

        col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.classList.remove('drag-over');
            
            const dealId = e.dataTransfer.getData('text/plain');
            const targetStage = col.getAttribute('data-stage');
            
            const deal = CRMState.deals.find(d => d.id === dealId);
            if (deal && deal.etapa_funil !== targetStage) {
                deal.etapa_funil = targetStage;
                CRMState.saveToStorage();
                
                renderKanbanCards();
                updateDashboardViews();
            }
        });
    });

    renderKanbanCards();
}

export function renderKanbanCards() {
    const stages = ['triagem', 'proposta', 'negociacao'];
    
    stages.forEach(stage => {
        const wrapper = document.querySelector(`[data-stage="${stage}"] .kanban-cards-wrapper`);
        if (wrapper) wrapper.innerHTML = '';
    });

    const counters = { triagem: { count: 0, val: 0 }, proposta: { count: 0, val: 0 }, negociacao: { count: 0, val: 0 } };
    const activeDeals = CRMState.deals.filter(d => d.status === 'Aberto');

    activeDeals.forEach(deal => {
        const wrapper = document.querySelector(`[data-stage="${deal.etapa_funil}"] .kanban-cards-wrapper`);
        if (!wrapper) return;

        const contato = CRMState.contacts.find(c => c.id === deal.contact_id) || {};
        const empresa = CRMState.companies.find(comp => comp.id === contato.company_id) || {};

        counters[deal.etapa_funil].count++;
        counters[deal.etapa_funil].val += deal.valor;

        const card = document.createElement('div');
        card.className = 'deal-card';
        card.setAttribute('draggable', 'true');
        card.setAttribute('id', deal.id);

        const titleEl = document.createElement('div');
        titleEl.className = 'deal-title';
        titleEl.textContent = deal.title;

        const infoEl = document.createElement('div');
        infoEl.className = 'deal-info';
        
        const empresaSpan = document.createElement('span');
        empresaSpan.textContent = empresa.nome_fantasia || 'Sem Empresa';

        const valorSpan = document.createElement('span');
        valorSpan.className = 'deal-value';
        valorSpan.textContent = deal.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

        infoEl.appendChild(empresaSpan);
        infoEl.appendChild(valorSpan);
        card.appendChild(titleEl);
        card.appendChild(infoEl);

        card.addEventListener('click', () => {
            openLeadDrawer(deal.id);
        });

        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', deal.id);
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });

        wrapper.appendChild(card);
    });

    stages.forEach(stage => {
        const countEl = document.getElementById(`calc-count-${stage}`);
        const valEl = document.getElementById(`calc-val-${stage}`);
        if (countEl) countEl.textContent = counters[stage].count;
        if (valEl) valEl.textContent = counters[stage].val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    });
}