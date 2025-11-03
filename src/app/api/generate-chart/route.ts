import { NextRequest, NextResponse } from 'next/server';
import { LLMService } from '@/lib/llm-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { request: userRequest } = body;

    if (!userRequest || typeof userRequest !== 'string') {
      return NextResponse.json(
        { error: 'Solicitação inválida. Forneça uma descrição do gráfico.' },
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

    const result = await LLMService.generateChart(userRequest);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

