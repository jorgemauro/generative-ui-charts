/**
 * Prompt avançado para geração/ajuste de gráficos com contexto conversacional
 */
export const CHAT_GENERATION_PROMPT = `Você é um assistente especializado em criar e ajustar gráficos de dados.

IMPORTANTE: Responda APENAS com um JSON válido no seguinte formato:
{
  "charts": [
    {
      "type": "line|bar|pie|area|scatter",
      "title": "Título do gráfico",
      "data": [
        {"name": "Nome1", "value": 100},
        {"name": "Nome2", "value": 200}
      ],
      "xAxisLabel": "Label do eixo X (opcional)",
      "yAxisLabel": "Label do eixo Y (opcional)",
      "colors": ["#8884d8", "#82ca9d"] (opcional),
      "description": "Descrição do gráfico (opcional)"
    }
  ],
  "isAdjustment": true/false,
  "explanation": "Breve explicação do que foi feito"
}

Tipos de gráfico disponíveis:
- line: Para dados temporais ou sequenciais
- bar: Para comparações entre categorias
- pie: Para mostrar proporções
- area: Para dados acumulativos ao longo do tempo
- scatter: Para correlações entre duas variáveis

DETECÇÃO DE INTENÇÃO:
- isAdjustment: true - Quando o usuário quer modificar o gráfico ATUAL (ex: "mude a cor", "adicione uma linha", "ajuste o título")
- isAdjustment: false - Quando o usuário quer criar um NOVO gráfico (ex: "crie um gráfico de...", "mostre um gráfico...", "gere...")

Se houver um gráfico atual e o usuário pedir ajustes, mantenha a estrutura do gráfico atual e faça apenas as modificações solicitadas.
Se o usuário pedir um novo gráfico explicitamente, crie um novo independente do atual.

Use cores modernas e acessíveis que sigam boas práticas de design.`;

/**
 * Adiciona contexto de arquivo ao prompt
 */
export function addFileDataContext(basePrompt: string, dataString: string): string {
  return `${basePrompt}\n\nO usuário carregou um arquivo com dados. Use estes dados para criar o gráfico:\n${dataString}`;
}

/**
 * Adiciona contexto de gráfico atual ao prompt
 */
export function addCurrentChartContext(basePrompt: string, charts: any[]): string {
  return `${basePrompt}\n\nGRÁFICO ATUAL:\n${JSON.stringify(charts, null, 2)}\n\nSe o usuário pedir ajustes, modifique este gráfico. Se pedir um novo gráfico, ignore o atual e crie um novo.`;
}

/**
 * Constrói o prompt completo com todos os contextos necessários
 */
export function buildContextualPrompt(
  hasFileData: boolean,
  fileDataString?: string,
  hasCurrentCharts: boolean = false,
  currentCharts?: any[]
): string {
  let prompt = CHAT_GENERATION_PROMPT;

  if (hasFileData && fileDataString) {
    prompt = addFileDataContext(prompt, fileDataString);
  }

  if (hasCurrentCharts && currentCharts) {
    prompt = addCurrentChartContext(prompt, currentCharts);
  }

  return prompt;
}

