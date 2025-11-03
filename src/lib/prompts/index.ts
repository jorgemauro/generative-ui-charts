/**
 * Exportações centralizadas de todos os prompts
 * 
 * Este arquivo serve como ponto único de importação para todos os prompts
 * do sistema de UI Generativa.
 */

export { CHART_GENERATION_PROMPT } from './chart-prompt';

export {
  CHAT_GENERATION_PROMPT,
  addFileDataContext,
  addCurrentChartContext,
  buildContextualPrompt,
} from './chat-prompt';

// Futuramente, adicione aqui novos prompts:
// export { FORM_GENERATION_PROMPT } from './form-prompt';
// export { TABLE_GENERATION_PROMPT } from './table-prompt';
// export { DASHBOARD_GENERATION_PROMPT } from './dashboard-prompt';

