/* js/dashboard.js */
import { CRMState } from './app.js';

let chartInstance = null;

export function initDashboard() {
    updateDashboardViews();
}

export function updateDashboardViews() {
    // 1. Processar dados para o Widget de Metas Gamificado
    const totalAtingido = CRMState.deals
        .filter(d => d.etapa_funil === 'negociacao') // Considera as negociações na última etapa como próximas da meta
        .reduce((sum, d) => sum + d.valor, 0);

    const percentual = Math.min(Math.round((totalAtingido / CRMState.metaMensal) * 100), 100);
    
    // Injetar dados limpos na UI
    document.getElementById('gamified-percentage').textContent = `${percentual}%`;
    document.getElementById('gamified-current-value').textContent = `${totalAtingido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} atingidos`;
    
    const fillBar = document.getElementById('widget-progress-fill');
    fillBar.style.width = `${percentual}%`;

    // 2. Renderizar Feed Omnichannel Líquido de Atividades Históricas
    const timeline = document.getElementById('timeline-feed');
    timeline.innerHTML = '';
    CRMState.activities.forEach(act => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        const boldType = document.createElement('strong');
        boldType.textContent = `[${act.tipo}] `;
        
        const descSpan = document.createElement('span');
        descSpan.textContent = act.descricao;

        item.appendChild(boldType);
        item.appendChild(descSpan);
        timeline.appendChild(item);
    });

    // 3. Renderizar ou Atualizar Gráfico Dinâmico via Chart.js
    const ctx = document.getElementById('analyticsChart');
    if (!ctx) return;

    // Calcular valores agregados das etapas para popular o Chart
    const valoresEtapas = ['triagem', 'proposta', 'negociacao'].map(stage => {
        return CRMState.deals
            .filter(d => d.etapa_funil === stage)
            .reduce((sum, d) => sum + d.valor, 0);
    });

    if (chartInstance) {
        chartInstance.data.datasets[0].data = valoresEtapas;
        chartInstance.update();
    } else {
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Triagem', 'Proposta', 'Negociação'],
                datasets: [{
                    label: 'Volume de Caixa por Etapa (R$)',
                    data: valoresEtapas,
                    backgroundColor: ['#0066FF', '#10B981', '#F59E0B'],
                    borderWidth: 0,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { display: false } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}