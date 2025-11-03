/**
 * Utilitário para limpar o histórico do localStorage
 * Útil quando há problemas de migração de dados
 */

const STORAGE_KEY = 'chart-history';

export function clearChartHistory(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Histórico limpo com sucesso');
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
    }
  }
}

// Função para acessar via console do navegador
if (typeof window !== 'undefined') {
  (window as any).clearChartHistory = clearChartHistory;
}

