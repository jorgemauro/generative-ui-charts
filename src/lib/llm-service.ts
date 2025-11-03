import OpenAI from 'openai';
import { buildContextualPrompt } from './prompts';

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
}

