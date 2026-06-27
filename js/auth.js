/**
 * IS CRM — auth.js
 * Controle de Sessão, Segurança e Guarda de Rotas.
 */

const STORAGE_KEY_AUTH = 'iscrm_session';

export const AuthModule = {
    // Verifica se o usuário está autenticado
    isAuthenticated() {
        const session = localStorage.getItem(STORAGE_KEY_AUTH);
        return session !== null;
    },

    // Executa a Guarda de Rotas exigida na especificação
    guardRoute() {
        if (!this.isAuthenticated()) {
            console.warn('[IS CRM] Acesso negado. Redirecionando para autenticação...');
            // Simula o redirecionamento seguro mandando para uma rota de login/bloqueio
            // Em produção: window.location.replace('/login.html')
            alert('Sessão ausente ou expirada! Por favor, faça login.');
            this.mockLogin(); // Mock automático para desenvolvimento não travar
        }
    },

    // Cria uma sessão mockada para o Rafael Barbosa
    mockLogin() {
        const mockUser = {
            id: 'u-vendedor-1',
            nome: 'Rafael Barbosa',
            role: 'Vendedor Sênior',
            avatar: 'RB'
        };
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(mockUser));
        console.info('[IS CRM] Sessão de desenvolvimento criada com sucesso.');
    },

    logout() {
        localStorage.removeItem(STORAGE_KEY_AUTH);
        window.location.reload();
    }
};