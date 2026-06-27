/**
 * IS CRM — dashboard.js
 */
import { CRMState, formatCurrency } from './app.js';
import { renderKanbanCards } from './kanban.js';

let chartInstance = null;
let currentActiveDrawerDealId = null;

export function initDashboard() {
    updateDashboardViews();
    initDrawerActivityForm();
    initDrawerStatusButtons();
}

export function updateDashboardViews() {
    const totalAtingido = CRMState.deals
        .filter(d => d.status === 'Ganho')
        .reduce((sum, d) => sum + d.valor, 0);

    const percentual = Math.min(Math.round((totalAtingido / CRMState.metaMensal) * 100), 100);
    
    const percentEl = document.getElementById('goal-percentage');
    const fillEl = document.getElementById('goal-bar-fill');
    
    if (percentEl && fillEl) {
        percentEl.textContent = `${percentual}%`;
        fillEl.style.width = `${percentual}%`;
        
        fillEl.classList.remove('level-low', 'level-mid', 'level-high', 'level-done');
        if (percentual < 40) fillEl.classList.add('level-low');
        else if (percentual < 70) fillEl.classList.add('level-mid');
        else if (percentual < 100) fillEl.classList.add('level-high');
        else fillEl.classList.add('level-done');
    }

    if (document.getElementById('goal-current')) {
        document.getElementById('goal-current').textContent = formatCurrency(totalAtingido);
        document.getElementById('goal-target').textContent = formatCurrency(CRMState.metaMensal);
    }

    const kpiBadge = document.getElementById('global-kanban-badge');
    if (kpiBadge) kpiBadge.textContent = CRMState.deals.filter(d => d.status === 'Aberto').length;

    const listContainer = document.getElementById('activity-list');
    if (listContainer) {
        listContainer.innerHTML = '';
        CRMState.activities.slice(0, 5).forEach(act => {
            const li = document.createElement('li');
            li.className = 'activity-item';

            const dot = document.createElement('div');
            dot.className = 'activity-item__dot';
            dot.style.background = `var(${act.cor || '--color-accent'})`;

            const body = document.createElement('div');
            body.className = 'activity-item__body';

            const title = document.createElement('div');
            title.className = 'activity-item__title';
            title.textContent = act.descricao;

            const sub = document.createElement('div');
            sub.className = 'activity-item__sub';
            sub.textContent = `Ação: ${act.tipo}`;

            const time = document.createElement('span');
            time.className = 'activity-item__time';
            time.textContent = act.tempo;

            body.appendChild(title);
            body.appendChild(sub);
            li.appendChild(dot);
            li.appendChild(body);
            li.appendChild(time);
            listContainer.appendChild(li);
        });
    }

    renderAnalyticsChart();
}

function renderAnalyticsChart() {
    const canvas = document.getElementById('chart-revenue');
    if (!canvas) return;

    const style = getComputedStyle(document.body);
    const accentColor = style.getPropertyValue('--color-accent').trim() || '#0066FF';
    const textColor = style.getPropertyValue('--color-text-secondary').trim() || '#9CA3AF';
    const borderColor = style.getPropertyValue('--color-border').trim() || '#252D40';

    const valoresEtapas = ['triagem', 'proposta', 'negociacao'].map(stage => {
        return CRMState.deals
            .filter(d => d.etapa_funil === stage && d.status === 'Aberto')
            .reduce((sum, d) => sum + d.valor, 0);
    });

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Triagem', 'Proposta', 'Negociação'],
            datasets: [{
                label: 'Pipeline Ativo (R$)',
                data: valoresEtapas,
                backgroundColor: [accentColor, '#10B981', '#F59E0B'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: borderColor }, ticks: { color: textColor } },
                x: { grid: { display: false }, ticks: { color: textColor } }
            }
        }
    });
}

export function openLeadDrawer(dealId) {
    currentActiveDrawerDealId = dealId;
    const deal = CRMState.deals.find(d => d.id === dealId);
    if (!deal) return;

    const contato = CRMState.contacts.find(c => c.id === deal.contact_id) || {};
    const empresa = CRMState.companies.find(comp => comp.id === contato.company_id) || {};

    document.getElementById('drawer-deal-title').textContent = deal.title;
    document.getElementById('drawer-contact-name').textContent = contato.nome || 'Não Informado';
    document.getElementById('drawer-contact-role').textContent = contato.cargo || 'Não Informado';
    document.getElementById('drawer-contact-phone').textContent = contato.telefone || 'Não Informado';
    document.getElementById('drawer-contact-email').textContent = contato.email || 'Não Informado';
    document.getElementById('drawer-company-name').textContent = empresa.nome_fantasia || 'Não Informado';
    document.getElementById('drawer-company-segment').textContent = empresa.setor || 'Não Informado';
    document.getElementById('drawer-company-cnpj').textContent = empresa.cnpj || 'Não Informado';
    document.getElementById('drawer-deal-value').textContent = formatCurrency(deal.valor);

    renderLeadSpecificTimeline(dealId);
    document.getElementById('lead-drawer').classList.add('active');
}

function renderLeadSpecificTimeline(dealId) {
    const timelineContainer = document.getElementById('lead-specific-timeline');
    if (!timelineContainer) return;

    timelineContainer.innerHTML = '';
    const filteredActivities = CRMState.activities.filter(act => act.deal_id === dealId);

    if (filteredActivities.length === 0) {
        timelineContainer.innerHTML = `<p style="font-size:12px; color:var(--color-text-muted); text-align:center;">Nenhuma interação registrada.</p>`;
        return;
    }

    filteredActivities.forEach(act => {
        const li = document.createElement('li');
        li.className = 'activity-item';
        li.style.padding = '8px 0';

        const dot = document.createElement('div');
        dot.className = 'activity-item__dot';
        dot.style.background = `var(${act.cor || '--color-accent'})`;

        const body = document.createElement('div');
        body.className = 'activity-item__body';

        const title = document.createElement('div');
        title.className = 'activity-item__title';
        title.style.fontSize = '13px';
        title.textContent = act.descricao;

        const sub = document.createElement('div');
        sub.className = 'activity-item__sub';
        sub.textContent = `Via: ${act.tipo} · ${act.tempo}`;

        body.appendChild(title);
        body.appendChild(sub);
        li.appendChild(dot);
        li.appendChild(body);
        timelineContainer.appendChild(li);
    });
}

function initDrawerActivityForm() {
    const form = document.getElementById('form-add-activity');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentActiveDrawerDealId) return;

        const type = document.getElementById('activity-type').value;
        const desc = document.getElementById('activity-desc').value;

        let corToken = '--color-accent';
        if (type === 'Call') corToken = '--color-warning';
        if (type === 'Nota') corToken = '--color-text-secondary';

        CRMState.activities.unshift({
            id: crypto.randomUUID(),
            deal_id: currentActiveDrawerDealId,
            tipo: type,
            descricao: desc,
            tempo: 'agora mesmo',
            cor: corToken
        });

        CRMState.saveToStorage();
        renderLeadSpecificTimeline(currentActiveDrawerDealId);
        updateDashboardViews();
        form.reset();
    });
}

function initDrawerStatusButtons() {
    const btnGanho = document.getElementById('btn-status-ganho');
    const btnPerdido = document.getElementById('btn-status-perdido');

    if (btnGanho && btnPerdido) {
        btnGanho.addEventListener('click', () => {
            if (!currentActiveDrawerDealId) return;
            const deal = CRMState.deals.find(d => d.id === currentActiveDrawerDealId);
            if (deal) {
                deal.status = 'Ganho';
                CRMState.activities.unshift({
                    id: crypto.randomUUID(),
                    deal_id: currentActiveDrawerDealId,
                    tipo: 'Status',
                    descricao: '🏆 Oportunidade ganha!',
                    tempo: 'agora mesmo',
                    cor: '--color-success'
                });
                CRMState.saveToStorage();
                document.getElementById('lead-drawer').classList.remove('active');
                renderKanbanCards();
                updateDashboardViews();
            }
        });

        btnPerdido.addEventListener('click', () => {
            if (!currentActiveDrawerDealId) return;
            const deal = CRMState.deals.find(d => d.id === currentActiveDrawerDealId);
            if (deal) {
                deal.status = 'Perdido';
                CRMState.activities.unshift({
                    id: crypto.randomUUID(),
                    deal_id: currentActiveDrawerDealId,
                    tipo: 'Status',
                    descricao: '❌ Negócio fechado como Perdido.',
                    tempo: 'agora mesmo',
                    cor: '--color-danger'
                });
                CRMState.saveToStorage();
                document.getElementById('lead-drawer').classList.remove('active');
                renderKanbanCards();
                updateDashboardViews();
            }
        });
    }
}