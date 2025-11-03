import OpenAI from 'openai';
import { 
  CHART_GENERATION_PROMPT,
  buildContextualPrompt 
} from './prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChartRequest {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  data: Array<{
    name: string;
    value: number;
    [key: string]: any;
  }>;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
  description?: string;
}

export interface LLMResponse {
  charts: ChartRequest[];
  error?: string;
}

// Mensagem do chat
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  chartData?: ChartRequest[];
}

// Resposta com intenção detectada
export interface LLMResponseWithIntent extends LLMResponse {
  isAdjustment: boolean; // true = ajuste, false = novo gráfico
  explanation?: string; // Explicação da intenção detectada
}

// Dados de arquivo carregado
export interface FileData {
  filename: string;
  data: Array<Record<string, any>>;
  columns: string[];
}

export class LLMService {
  static async generateChart(userRequest: string): Promise<LLMResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: CHART_GENERATION_PROMPT },
          { role: "user", content: userRequest }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Resposta vazia da API');
      }

      // Tentar fazer parse do JSON
      try {
        const parsed = JSON.parse(content);
        return parsed as LLMResponse;
      } catch (parseError) {
        // Se não conseguir fazer parse, tentar extrair JSON da resposta
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed as LLMResponse;
        }
        throw new Error('Não foi possível extrair dados válidos da resposta');
      }
    } catch (error) {
      console.error('Erro ao gerar gráfico:', error);
      return {
        charts: [],
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Gera ou ajusta gráfico com base no contexto da conversa
   */
  static async generateOrAdjustChart(
    userMessage: string,
    chatHistory: ChatMessage[],
    currentCharts?: ChartRequest[],
    fileData?: FileData
  ): Promise<LLMResponseWithIntent> {
    try {
      const hasCurrentChart = currentCharts && currentCharts.length > 0;
      
      // Preparar string de dados do arquivo se houver
      let fileDataString: string | undefined;
      if (fileData) {
        const { FileParser } = await import('./file-parser');
        fileDataString = FileParser.dataToString(fileData, 15);
      }

      // Construir prompt contextual usando funções helper
      const systemPrompt = buildContextualPrompt(
        !!fileData,
        fileDataString,
        hasCurrentChart,
        currentCharts
      );

      // Construir histórico de mensagens para o OpenAI
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt }
      ];

      // Adicionar histórico recente (últimas 5 mensagens)
      const recentHistory = chatHistory.slice(-5);
      recentHistory.forEach((msg) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });

      // Adicionar mensagem atual
      messages.push({
        role: 'user',
        content: userMessage
      });

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Resposta vazia da API');
      }

      // Parse do JSON
      try {
        const parsed = JSON.parse(content);
        return {
          charts: parsed.charts || [],
          isAdjustment: parsed.isAdjustment || false,
          explanation: parsed.explanation,
        } as LLMResponseWithIntent;
      } catch (parseError) {
        // Tentar extrair JSON da resposta
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            charts: parsed.charts || [],
            isAdjustment: parsed.isAdjustment || false,
            explanation: parsed.explanation,
          } as LLMResponseWithIntent;
        }
        throw new Error('Não foi possível extrair dados válidos da resposta');
      }
    } catch (error) {
      console.error('Erro ao gerar/ajustar gráfico:', error);
      return {
        charts: [],
        isAdjustment: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  static async generateSampleData(chartType: string): Promise<ChartRequest> {
    const sampleData = {
      line: {
        type: 'line' as const,
        title: 'Vendas ao Longo do Tempo',
        data: [
          { name: 'Jan', value: 400 },
          { name: 'Fev', value: 300 },
          { name: 'Mar', value: 600 },
          { name: 'Abr', value: 800 },
          { name: 'Mai', value: 500 },
          { name: 'Jun', value: 700 }
        ],
        xAxisLabel: 'Mês',
        yAxisLabel: 'Vendas (R$)',
        colors: ['#8884d8']
      },
      bar: {
        type: 'bar' as const,
        title: 'Vendas por Produto',
        data: [
          { name: 'Produto A', value: 1200 },
          { name: 'Produto B', value: 1900 },
          { name: 'Produto C', value: 3000 },
          { name: 'Produto D', value: 2800 },
          { name: 'Produto E', value: 1890 }
        ],
        xAxisLabel: 'Produtos',
        yAxisLabel: 'Vendas (R$)',
        colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00']
      },
      pie: {
        type: 'pie' as const,
        title: 'Distribuição de Vendas',
        data: [
          { name: 'Desktop', value: 400 },
          { name: 'Mobile', value: 300 },
          { name: 'Tablet', value: 200 },
          { name: 'Outros', value: 100 }
        ],
        colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']
      }
    };

    return sampleData[chartType as keyof typeof sampleData] || sampleData.bar;
  }
}

