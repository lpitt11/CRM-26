/**
 * IS CRM — app.js
 * Módulo de inicialização: tema, preferências e utilitários globais.
 * ─────────────────────────────────────────────────────────────────
 * Padrão: ES6 Module (type="module" no HTML)
 */

// ── Constantes ────────────────────────────────────────────────────
const STORAGE_KEY_THEME = 'iscrm_theme';
const THEME_DARK  = 'theme-dark';
const THEME_LIGHT = 'theme-light';

// ── Tema ──────────────────────────────────────────────────────────

/**
 * Retorna o tema salvo no LocalStorage,
 * ou usa a preferência do sistema operacional como fallback.
 */
function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY_THEME);
  if (stored === THEME_DARK || stored === THEME_LIGHT) return stored;

  // Respeita prefers-color-scheme se não houver preferência salva
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? THEME_LIGHT
    : THEME_DARK;
}

/**
 * Aplica o tema ao <body> e atualiza o ícone do botão de toggle.
 * @param {string} theme — 'theme-dark' | 'theme-light'
 */
function applyTheme(theme) {
  document.body.classList.remove(THEME_DARK, THEME_LIGHT);
  document.body.classList.add(theme);
  localStorage.setItem(STORAGE_KEY_THEME, theme);
  updateThemeIcon(theme);
}

/**
 * Alterna entre dark e light.
 */
function toggleTheme() {
  const current = document.body.classList.contains(THEME_DARK) ? THEME_DARK : THEME_LIGHT;
  applyTheme(current === THEME_DARK ? THEME_LIGHT : THEME_DARK);
}

/**
 * Atualiza o ícone SVG exibido no botão de toggle.
 * @param {string} theme
 */
function updateThemeIcon(theme) {
  const btn = document.getElementById('btn-theme-toggle');
  if (!btn) return;

  // Sol = light mode ativo; Lua = dark mode ativo
  btn.innerHTML = theme === THEME_DARK
    ? `<!-- Ícone: Lua (modo escuro ativo) -->
       <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
         <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
       </svg>`
    : `<!-- Ícone: Sol (modo claro ativo) -->
       <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
         <circle cx="12" cy="12" r="5"/>
         <line x1="12" y1="1" x2="12" y2="3"/>
         <line x1="12" y1="21" x2="12" y2="23"/>
         <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
         <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
         <line x1="1" y1="12" x2="3" y2="12"/>
         <line x1="21" y1="12" x2="23" y2="12"/>
         <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
         <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
       </svg>`;

  btn.setAttribute('aria-label',
    theme === THEME_DARK ? 'Mudar para tema claro' : 'Mudar para tema escuro');
}

// ── Widget de Meta (Gamificação) ──────────────────────────────────

/**
 * Inicializa o widget de progresso de meta do mês.
 * @param {number} current - Valor atual de vendas
 * @param {number} target  - Meta financeira do mês
 */
function initGoalWidget(current, target) {
  const pct = Math.min(Math.round((current / target) * 100), 100);

  const percentEl = document.getElementById('goal-percentage');
  const fillEl    = document.getElementById('goal-bar-fill');
  const currentEl = document.getElementById('goal-current');
  const targetEl  = document.getElementById('goal-target');

  if (!percentEl || !fillEl) return;

  // Determina a "fase" de cor baseada no progresso
  let level;
  if (pct < 40)       level = 'level-low';
  else if (pct < 70)  level = 'level-mid';
  else if (pct < 100) level = 'level-high';
  else                level = 'level-done';

  // Remove classes anteriores e aplica a nova
  fillEl.classList.remove('level-low', 'level-mid', 'level-high', 'level-done');
  fillEl.classList.add(level);

  // Cor do percentual segue o level
  const colors = {
    'level-low':  'var(--color-danger)',
    'level-mid':  'var(--color-warning)',
    'level-high': 'var(--color-success)',
    'level-done': 'var(--color-accent)',
  };
  percentEl.style.color = colors[level];

  // Animação progressiva do contador
  animateCounter(percentEl, 0, pct, 900, (v) => `${v}%`);

  // Preenche a barra com transição CSS
  requestAnimationFrame(() => {
    fillEl.style.width = `${pct}%`;
  });

  // Formata valores monetários
  if (currentEl) currentEl.textContent = formatCurrency(current);
  if (targetEl)  targetEl.textContent  = formatCurrency(target);
}

// ── Utilitários ───────────────────────────────────────────────────

/**
 * Formata um número como moeda BRL.
 */
function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

/**
 * Anima um contador numérico de `from` até `to` em `duration` ms.
 * @param {HTMLElement} el
 * @param {number} from
 * @param {number} to
 * @param {number} duration
 * @param {Function} formatter - ex: (v) => `${v}%`
 */
function animateCounter(el, from, to, duration, formatter = (v) => v) {
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = formatter(Math.round(from + (to - from) * eased));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/**
 * Higieniza texto do usuário para evitar XSS.
 * Sempre use textContent (não innerHTML) ao inserir dados externos.
 * Esta função retorna um nó de texto seguro.
 * @param {string} str
 * @returns {string}
 */
export function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML; // Escapa caracteres especiais sem executar HTML
}

// ── Inicialização ─────────────────────────────────────────────────

/**
 * Ponto de entrada. Executado após o DOM estar pronto.
 */
function init() {
  // 1. Aplica o tema imediatamente (antes do primeiro frame)
  applyTheme(getInitialTheme());

  // 2. Registra o listener do botão de toggle
  const themeBtn = document.getElementById('btn-theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // 3. Inicializa o widget de meta com dados de exemplo
  //    → substituir por chamada à API de persistência (Supabase/Firebase)
  initGoalWidget(87_500, 150_000);

  console.info('[IS CRM] Aplicação inicializada.');
}

// Garante execução após o DOM carregar, mesmo com script carregado em <head>
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Exporta helpers úteis para outros módulos
export { applyTheme, toggleTheme, formatCurrency, animateCounter };
