/**
 * IS CRM — app.js
 * Inicializador Global, Roteamento SPA e Orquestrador Relacional.
 */
import { initDashboard, updateDashboardViews } from './dashboard.js';
import { initKanban, renderKanbanCards } from './kanban.js';

// ── 1. EMBUTIDO: CAMADA DE PROTEÇÃO DE SESSÃO NATAL ──
const AuthModule = {
    isAuthenticated() {
        return localStorage.getItem('iscrm_session') !== null;
    },
    guardRoute() {
        if (!this.isAuthenticated()) {
            // Força a criação automática de uma sessão local estável de dev para o Rafael
            localStorage.setItem('iscrm_session', JSON.stringify({ id: 'u-vendedor-1', nome: 'Rafael Barbosa' }));
        }
    }
};
AuthModule.guardRoute();

// ── 2. MODELAGEM DE BANCO DE DADOS RELACIONAL COMPLETA ──
export const CRMState = {
    users: [
        { id: 'u-vendedor-1', nome: 'Rafael Barbosa', email: 'rafael@iscrm.com.br', meta_mensal: 100000, role_acesso: 'Vendedor Sênior' }
    ],
    companies: JSON.parse(localStorage.getItem('iscrm_companies')) || [
        { id: 'comp-1', nome_fantasia: 'Grupo Nexus', cnpj: '12.345.678/0001-99', setor: 'Tecnologia', data_cadastro: '2026-01-15' },
        { id: 'comp-2', nome_fantasia: 'TechStart Ltda', cnpj: '98.765.432/0001-00', setor: 'Educação', data_cadastro: '2026-03-22' },
        { id: 'comp-3', nome_fantasia: 'Construtora Vale', cnpj: '44.555.666/0001-11', setor: 'Infraestrutura', data_cadastro: '2025-11-02' }
    ],
    contacts: JSON.parse(localStorage.getItem('iscrm_contacts')) || [
        { id: 'cont-1', nome: 'Carlos Eduardo', email: 'carlos@nexus.com', telefone: '(11) 99999-1111', cargo: 'CTO', company_id: 'comp-1' },
        { id: 'cont-2', nome: 'Mariana Costa', email: 'mariana@techstart.io', telefone: '(21) 98888-2222', cargo: 'Diretora de Operações', company_id: 'comp-2' },
        { id: 'cont-3', nome: 'Roberto Silva', email: 'roberto@vale.com.br', telefone: '(41) 97777-3333', cargo: 'Diretor de Compras', company_id: 'comp-3' }
    ],
    deals: JSON.parse(localStorage.getItem('iscrm_deals')) || [
        { id: 'deal-1', title: 'Implantação ERP Corp', valor: 28000, etapa_funil: 'triagem', status: 'Aberto', user_id: 'u-vendedor-1', contact_id: 'cont-1' },
        { id: 'deal-2', title: 'Consultoria Cloud Avançada', valor: 45000, etapa_funil: 'proposta', status: 'Aberto', user_id: 'u-vendedor-1', contact_id: 'cont-2' },
        { id: 'deal-3', title: 'Licenças Enterprise', valor: 31500, etapa_funil: 'negociacao', status: 'Aberto', user_id: 'u-vendedor-1', contact_id: 'cont-3' }
    ],
    activities: JSON.parse(localStorage.getItem('iscrm_activities')) || [
        { id: 'act-1', deal_id: 'deal-1', tipo: 'Email', descricao: 'E-mail comercial enviado com proposta anexa.', tempo: 'há 12 min', cor: '--color-accent' },
        { id: 'act-2', deal_id: 'deal-3', tipo: 'Call', descricao: 'Alinhamento de escopo técnico por telefone.', tempo: 'há 2h', cor: '--color-warning' }
    ],
    metaMensal: 100000,
    
    saveToStorage() {
        localStorage.setItem('iscrm_companies', JSON.stringify(this.companies));
        localStorage.setItem('iscrm_contacts', JSON.stringify(this.contacts));
        localStorage.setItem('iscrm_deals', JSON.stringify(this.deals));
        localStorage.setItem('iscrm_activities', JSON.stringify(this.activities));
    }
};

// ── 3. CORRIGIDO: MANIPULAÇÃO DINÂMICA DE TEMA (Conectado ao variables.css) ──
function initThemeControl() {
    const btn = document.getElementById('btn-theme-toggle');
    if (!btn) return;

    const updateIcon = (theme) => {
        btn.innerHTML = theme === 'theme-dark' 
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    };

    const currentTheme = localStorage.getItem('iscrm_theme') || 'theme-dark';
    document.body.className = currentTheme;
    updateIcon(currentTheme);

    btn.addEventListener('click', () => {
        const targetTheme = document.body.classList.contains('theme-dark') ? 'theme-light' : 'theme-dark';
        document.body.className = targetTheme;
        localStorage.setItem('iscrm_theme', targetTheme);
        updateIcon(targetTheme);
        updateDashboardViews(); // Redesenha o gráfico com as cores novas
    });
}

function initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        if ((e.key.toLowerCase() === 'n' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') || (e.altKey && e.key.toLowerCase() === 'n')) {
            e.preventDefault();
            const modal = document.getElementById('quick-lead-modal');
            if (modal) modal.classList.add('active');
        }
        if (e.key === 'Escape') {
            document.getElementById('quick-lead-modal').classList.remove('active');
            document.getElementById('lead-drawer').classList.remove('active');
        }
    });
}

function initSPARouting() {
    const navDashboard = document.getElementById('nav-dashboard');
    const navKanban = document.getElementById('nav-kanban');
    const viewDashboard = document.getElementById('dashboard-view-section');
    const viewKanban = document.getElementById('kanban-view-section');
    const topbarTitle = document.getElementById('topbar-title');

    if (navDashboard && navKanban && viewDashboard && viewKanban) {
        navDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            navKanban.classList.remove('active');
            navDashboard.classList.add('active');
            viewKanban.classList.remove('active');
            viewDashboard.classList.add('active');
            if (topbarTitle) topbarTitle.textContent = "Visão Geral";
            updateDashboardViews();
        });

        navKanban.addEventListener('click', (e) => {
            e.preventDefault();
            navDashboard.classList.remove('active');
            navKanban.classList.add('active');
            viewDashboard.classList.remove('active');
            viewKanban.classList.add('active');
            if (topbarTitle) topbarTitle.textContent = "Pipeline Kanban";
            renderKanbanCards();
        });
    }
}

function initModalControl() {
    const modal = document.getElementById('quick-lead-modal');
    const btnOpen = document.getElementById('btn-novo-lead');
    const btnClose = document.getElementById('btn-close-modal');
    const form = document.getElementById('form-quick-lead');

    if (btnOpen && modal) btnOpen.addEventListener('click', () => modal.classList.add('active'));
    if (btnClose && modal) btnClose.addEventListener('click', () => modal.classList.remove('active'));

    if (form && modal) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newCompanyId = crypto.randomUUID();
            const newContactId = crypto.randomUUID();
            const newDealId = crypto.randomUUID();

            CRMState.companies.push({
                id: newCompanyId,
                nome_fantasia: document.getElementById('lead-company').value,
                cnpj: '00.111.222/0001-33',
                setor: 'Outros Setores',
                data_cadastro: new Date().toISOString().split('T')[0]
            });

            CRMState.contacts.push({
                id: newContactId,
                nome: document.getElementById('lead-name').value,
                email: 'contato@prospeccao.com',
                telefone: '(11) 98888-7777',
                cargo: 'Decisor Principal',
                company_id: newCompanyId
            });

            const newDeal = {
                id: newDealId,
                title: `Oportunidade — ${document.getElementById('lead-company').value}`,
                valor: parseFloat(document.getElementById('lead-value').value) || 0,
                etapa_funil: 'triagem',
                status: 'Aberto',
                user_id: 'u-vendedor-1',
                contact_id: newContactId
            };
            CRMState.deals.push(newDeal);

            CRMState.activities.unshift({
                id: crypto.randomUUID(),
                deal_id: newDealId,
                tipo: 'Lead',
                descricao: `Lead criado via Entrada Rápida.`,
                tempo: 'agora mesmo',
                cor: '--color-accent'
            });

            CRMState.saveToStorage();

            renderKanbanCards();
            updateDashboardViews();

            form.reset();
            modal.classList.remove('active');
        });
    }
}

export function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function init() {
  initThemeControl();
  initSPARouting();
  initModalControl();
  initKeyboardShortcuts();
  initDashboard();
  initKanban();
  
  document.getElementById('btn-close-drawer').addEventListener('click', () => {
      document.getElementById('lead-drawer').classList.remove('active');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}