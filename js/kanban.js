/* js/kanban.js */
import { CRMState } from './app.js';
import { updateDashboardViews } from './dashboard.js';

export function initKanban() {
    const wrappers = document.querySelectorAll('.kanban-cards-wrapper');
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
            
            // Alterar o estado interno da negociação
            const deal = CRMState.deals.find(d => d.id === dealId);
            if (deal && deal.etapa_funil !== targetStage) {
                deal.etapa_funil = targetStage;
                CRMState.saveToStorage();
                
                // Recalcular e renderizar as interfaces afetadas de forma fluida
                renderKanbanCards();
                updateDashboardViews();
            }
        });
    });

    renderKanbanCards();
}

export function renderKanbanCards() {
    // Limpar containers
    const stages = ['triagem', 'proposta', 'negociacao'];
    stages.forEach(stage => {
        const col = document.querySelector(`[data-stage="${stage}"] .kanban-cards-wrapper`);
        if (col) col.innerHTML = '';
    });

    const counters = { triagem: { count: 0, val: 0 }, proposta: { count: 0, val: 0 }, negociacao: { count: 0, val: 0 } };

    CRMState.deals.forEach(deal => {
        const wrapper = document.querySelector(`[data-stage="${deal.etapa_funil}"] .kanban-cards-wrapper`);
        if (!wrapper) return;

        // Incrementar contadores
        counters[deal.etapa_funil].count++;
        counters[deal.etapa_funil].val += deal.valor;

        // Criar elemento HTML do Card de Oportunidade
        const card = document.createElement('div');
        card.className = 'deal-card';
        card.setAttribute('draggable', 'true');
        card.setAttribute('id', deal.id);

        // Uso obrigatório de textContent nos subelementos sensíveis para blindagem contra injeções XSS
        const titleEl = document.createElement('div');
        titleEl.className = 'deal-title';
        titleEl.textContent = deal.title;

        const infoEl = document.createElement('div');
        infoEl.className = 'deal-info';
        
        const empresaSpan = document.createElement('span');
        empresaSpan.textContent = deal.empresa;

        const valorSpan = document.createElement('span');
        valorSpan.className = 'deal-value';
        valorSpan.textContent = deal.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        infoEl.appendChild(empresaSpan);
        infoEl.appendChild(valorSpan);
        card.appendChild(titleEl);
        card.appendChild(infoEl);

        // Eventos Drag and Drop Nativo
        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', deal.id);
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });

        wrapper.appendChild(card);
    });

    // Atualizar os somatórios visuais das colunas no DOM
    stages.forEach(stage => {
        document.getElementById(`calc-count-${stage}`).textContent = counters[stage].count;
        document.getElementById(`calc-val-${stage}`).textContent = counters[stage].val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    });
}