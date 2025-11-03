import { NextRequest, NextResponse } from 'next/server';
import { LLMService, ChatMessage, FileData } from '@/lib/llm-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message: userMessage, 
      chatHistory, 
      currentCharts,
      fileData 
    } = body;

    // Validações
    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json(
        { error: 'Mensagem inválida. Forneça uma mensagem de texto.' },
        { status: 400 }
      );
    }

    // Verificar se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'API key do OpenAI não configurada. Configure a variável OPENAI_API_KEY.' },
        { status: 500 }
      );
    }

    // Validar chatHistory se fornecido
    const history: ChatMessage[] = Array.isArray(chatHistory) ? chatHistory : [];

    // Chamar o serviço LLM
    const result = await LLMService.generateOrAdjustChart(
      userMessage,
      history,
      currentCharts,
      fileData as FileData | undefined
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na API de chat:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

