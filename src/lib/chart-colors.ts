/**
 * Paleta de cores adaptável para gráficos
 * Cores que funcionam bem tanto em modo claro quanto escuro
 */

export const CHART_COLORS = {
  primary: [
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#06b6d4', // cyan-500
    '#f97316', // orange-500
    '#6366f1', // indigo-500
  ],
  vibrant: [
    '#0ea5e9', // sky-500
    '#a855f7', // purple-500
    '#f43f5e', // rose-500
    '#84cc16', // lime-500
    '#14b8a6', // teal-500
    '#eab308', // yellow-500
    '#ef4444', // red-500
    '#22c55e', // green-500
  ],
  pastel: [
    '#60a5fa', // blue-400
    '#a78bfa', // violet-400
    '#f472b6', // pink-400
    '#fbbf24', // amber-400
    '#34d399', // emerald-400
    '#22d3ee', // cyan-400
    '#fb923c', // orange-400
    '#818cf8', // indigo-400
  ],
};

/**
 * Retorna uma paleta de cores padrão para gráficos
 */
export function getDefaultChartColors(): string[] {
  return CHART_COLORS.primary;
}

/**
 * Garante que temos cores suficientes para os dados
 */
export function ensureColors(requestedCount: number, providedColors?: string[]): string[] {
  const baseColors = providedColors || getDefaultChartColors();
  
  if (baseColors.length >= requestedCount) {
    return baseColors.slice(0, requestedCount);
  }
  
  // Se não temos cores suficientes, repetir a paleta
  const colors: string[] = [];
  for (let i = 0; i < requestedCount; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  return colors;
}

