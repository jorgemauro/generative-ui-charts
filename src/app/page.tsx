'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartRenderer } from '@/components/charts/ChartRenderer';
import { FileUpload } from '@/components/FileUpload';
import { ChartHistory } from '@/components/ChartHistory';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useChartHistory, ChartVersion } from '@/hooks/useChartHistory';
import { ChatMessage, ChartRequest, FileData } from '@/lib/llm-service';
import { Loader2, Sparkles, BarChart3, TrendingUp, Wand2, PlusCircle } from 'lucide-react';
// Importa função de limpeza de histórico (acessível via console: window.clearChartHistory())
import '@/lib/clear-history';

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [charts, setCharts] = useState<ChartRequest[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Mantém histórico interno
  
  const {
    history,
    isLoaded: historyLoaded,
    addNewChart,
    addVersion,
    updateMessages,
    removeFromHistory,
    clearHistory,
  } = useChartHistory();

  const handleGenerateChart = async () => {
    if (!userInput.trim() && !fileData) return;

    const messageText = userInput.trim();
    setIsLoading(true);
    setError(null);

    // Criar mensagem do usuário para histórico interno
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          chatHistory: messages,
          currentCharts: charts.length > 0 ? charts : undefined,
          fileData: fileData || undefined,
        }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
        setCharts([]);
      } else {
        const { charts: newCharts, isAdjustment, explanation } = result;
        
        // Criar mensagem do assistente para histórico interno
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: explanation || (isAdjustment ? 'Gráfico ajustado!' : 'Gráfico criado!'),
          timestamp: Date.now(),
          chartData: newCharts,
        };

        const updatedMessages = [...messages, userMessage, assistantMessage];
        setMessages(updatedMessages);
        setCharts(newCharts);
        setError(null);

        // Gerenciar histórico
        if (isAdjustment && currentHistoryId) {
          // Adicionar versão ao histórico existente
          addVersion(currentHistoryId, messageText, newCharts, true, updatedMessages);
        } else {
          // Criar novo item no histórico
          const newHistoryId = addNewChart(messageText, newCharts, updatedMessages);
          setCurrentHistoryId(newHistoryId);
        }

        // Limpar input e arquivo após sucesso
        setUserInput('');
        setFileData(null);
      }
    } catch (err) {
      setError('Erro ao processar solicitação. Tente novamente.');
      setCharts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChart = () => {
    setUserInput('');
    setCharts([]);
    setCurrentHistoryId(null);
    setMessages([]);
    setError(null);
    setFileData(null);
  };

  const handleLoadFromHistory = (item: any, version?: ChartVersion) => {
    const selectedVersion = version || item.versions[item.versions.length - 1];
    
    // Restaurar estado
    setUserInput(selectedVersion.request);
    setCharts(selectedVersion.charts);
    setCurrentHistoryId(item.id);
    
    // Restaurar mensagens internas
    if (item.messages && item.messages.length > 0) {
      setMessages(item.messages);
    } else {
      setMessages([]);
    }
    
    setError(null);
    
    // Scroll suave para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileLoaded = (data: FileData) => {
    setFileData(data);
  };

  const handleFileClear = () => {
    setFileData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header com gradiente animado */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-xy opacity-50" />
        
        <div className="container relative mx-auto px-4 py-12">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-10 w-10 text-primary" />
              </motion.div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Generative Charts
              </h1>
              <TrendingUp className="h-10 w-10 text-primary" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descreva o gráfico que você quer e nossa IA criará para você. Ajuste quantas vezes quiser ou carregue arquivos CSV, JSON e Excel
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal - Gráficos e Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Charts Display - PRIMEIRO */}
            {!isLoading && charts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <TrendingUp className="h-6 w-6" />
                    Gráficos Gerados
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewChart}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Novo Gráfico
                  </Button>
                </div>
                <ChartRenderer charts={charts} />
              </motion.div>
            )}

            {/* Loading State */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-[300px] w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Error Display */}
            {error && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-destructive bg-destructive/5">
                  <CardContent className="pt-6">
                    <p className="text-destructive font-medium">{error}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Input Section - DEPOIS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {charts.length > 0 ? 'Ajustar ou Criar Novo' : 'Solicite seu gráfico'}
                  </CardTitle>
                  <CardDescription>
                    {charts.length > 0 
                      ? 'Descreva as mudanças que deseja fazer ou clique em "Novo Gráfico"'
                      : 'Descreva o tipo de gráfico, dados e visualização que você deseja'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {charts.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 px-3 py-2 rounded-md">
                      <Wand2 className="h-4 w-4" />
                      <span>Modo ajuste ativo - Suas alterações serão salvas como nova versão</span>
                    </div>
                  )}

                  <FileUpload
                    onFileLoaded={handleFileLoaded}
                    onFileClear={handleFileClear}
                    disabled={isLoading}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="chart-request">Descrição do gráfico</Label>
                    <Textarea
                      id="chart-request"
                      placeholder={
                        fileData
                          ? 'Descreva o gráfico que deseja criar com os dados do arquivo...'
                          : charts.length > 0
                          ? 'Ex: Mude a cor das barras para azul, ou adicione um gráfico de linha...'
                          : 'Ex: Crie um gráfico de barras mostrando as vendas de 5 produtos: Produto A (1200), Produto B (1900)...'
                      }
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="min-h-[120px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          handleGenerateChart();
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Dica: Pressione Ctrl+Enter para gerar
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleGenerateChart}
                    disabled={isLoading || (!userInput.trim() && !fileData)}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        {charts.length > 0 ? 'Ajustar Gráfico' : 'Gerar Gráfico'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Coluna lateral - Histórico */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="sticky top-4"
            >
              {historyLoaded && (
                <ChartHistory
                  history={history}
                  onSelectItem={handleLoadFromHistory}
                  onRemoveItem={removeFromHistory}
                  onClearHistory={clearHistory}
                />
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
