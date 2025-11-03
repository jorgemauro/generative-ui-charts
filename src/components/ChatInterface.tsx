'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/FileUpload';
import { ChartRenderer } from '@/components/charts/ChartRenderer';
import { ChatMessage, ChartRequest, FileData } from '@/lib/llm-service';
import { 
  Send, 
  Loader2, 
  Sparkles, 
  Bot, 
  User, 
  RefreshCw,
  FileText,
  Wand2,
  PlusCircle
} from 'lucide-react';

interface ChatInterfaceProps {
  onSendMessage: (message: string, fileData?: FileData) => Promise<void>;
  messages: ChatMessage[];
  isLoading: boolean;
  onNewChart: () => void;
  currentCharts?: ChartRequest[];
  hasActiveChart: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSendMessage,
  messages,
  isLoading,
  onNewChart,
  currentCharts,
  hasActiveChart,
}) => {
  const [input, setInput] = useState('');
  const [fileData, setFileData] = useState<FileData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize do textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() && !fileData) return;

    const messageText = input.trim();
    setInput('');
    
    // Limpar fileData após envio
    const currentFileData = fileData;
    setFileData(null);

    try {
      await onSendMessage(messageText, currentFileData || undefined);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileLoaded = (data: FileData) => {
    setFileData(data);
  };

  const handleFileClear = () => {
    setFileData(null);
  };

  const getPlaceholder = () => {
    if (fileData) {
      return 'Descreva o gráfico que deseja criar com estes dados...';
    }
    if (hasActiveChart) {
      return 'Ex: "Mude a cor das barras para azul" ou "Adicione um gráfico de linha"';
    }
    return 'Ex: "Crie um gráfico de barras mostrando vendas por mês"';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[300px] max-h-[600px]">
        <AnimatePresence initial={false}>
          {messages.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
              <h3 className="text-xl font-semibold mb-2">
                {hasActiveChart ? 'Ajuste seu gráfico' : 'Comece uma conversa'}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {hasActiveChart 
                  ? 'Descreva as mudanças que deseja fazer no gráfico atual'
                  : 'Descreva o gráfico que você quer criar ou carregue um arquivo com seus dados'
                }
              </p>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              )}

              <Card
                className={`max-w-[85%] ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card'
                }`}
              >
                <CardContent className="p-3">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.chartData && message.chartData.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <ChartRenderer charts={message.chartData} />
                    </div>
                  )}
                </CardContent>
              </Card>

              {message.role === 'user' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <Card className="bg-card">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Processando...
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Área de input */}
      <div className="space-y-3 border-t pt-4">
        {hasActiveChart && (
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Wand2 className="h-4 w-4" />
              <span>Modo ajuste de gráfico ativo</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onNewChart}
              className="h-7 text-xs"
            >
              <PlusCircle className="h-3 w-3 mr-1" />
              Novo Gráfico
            </Button>
          </div>
        )}

        <FileUpload
          onFileLoaded={handleFileLoaded}
          onFileClear={handleFileClear}
          disabled={isLoading}
        />

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              disabled={isLoading}
              className="min-h-[60px] max-h-[200px] resize-none pr-12"
              rows={1}
            />
            {fileData && (
              <div className="absolute bottom-2 right-2">
                <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  <FileText className="h-3 w-3" />
                  <span>{fileData.filename}</span>
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !fileData)}
            size="lg"
            className="self-end"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Pressione Ctrl+Enter para enviar
        </p>
      </div>
    </div>
  );
};

