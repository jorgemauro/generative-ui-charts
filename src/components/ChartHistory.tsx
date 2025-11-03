'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Trash2, RotateCcw, ChevronDown, ChevronRight, Layers, Sparkles } from 'lucide-react';
import { HistoryItem, ChartVersion } from '@/hooks/useChartHistory';

interface ChartHistoryProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem, version?: ChartVersion) => void;
  onRemoveItem: (id: string) => void;
  onClearHistory: () => void;
}

export const ChartHistory: React.FC<ChartHistoryProps> = ({
  history,
  onSelectItem,
  onRemoveItem,
  onClearHistory,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days}d atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico
          </CardTitle>
          <CardDescription>
            Seus gráficos gerados aparecerão aqui
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum histórico ainda</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico
            </CardTitle>
            <CardDescription>
              {history.length} {history.length === 1 ? 'item' : 'itens'} salvos
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearHistory}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {history.map((item) => {
              // Verificações de segurança
              if (!item.versions || !Array.isArray(item.versions) || item.versions.length === 0) {
                return null; // Ignora itens inválidos
              }

              const isExpanded = expandedItems.has(item.id);
              const hasMultipleVersions = item.versions.length > 1;
              const latestVersion = item.versions[item.versions.length - 1];

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1"
                >
                  {/* Item principal */}
                  <div className="group relative flex items-start gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    {hasMultipleVersions && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-6 w-6"
                        onClick={() => toggleExpand(item.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-6 w-6"
                      onClick={() => onSelectItem(item, latestVersion)}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                    
                    <div 
                      className="flex-1 min-w-0 cursor-pointer" 
                      onClick={() => onSelectItem(item, latestVersion)}
                    >
                      <p className="text-sm font-medium line-clamp-2 mb-1">
                        {item.originalRequest}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span>{formatTimestamp(item.timestamp)}</span>
                        {hasMultipleVersions && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Layers className="h-3 w-3" />
                              {item.versions.length} versões
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>
                          {latestVersion.charts.length} {latestVersion.charts.length === 1 ? 'gráfico' : 'gráficos'}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(item.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>

                  {/* Versões expandidas */}
                  <AnimatePresence>
                    {isExpanded && hasMultipleVersions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-8 space-y-1"
                      >
                        {item.versions.map((version, versionIndex) => (
                          <motion.div
                            key={version.versionId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: versionIndex * 0.05 }}
                            className="group/version relative flex items-start gap-2 p-2 rounded-md border border-dashed bg-card/50 hover:bg-accent/30 transition-colors"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                {version.isAdjustment ? (
                                  <Sparkles className="h-3 w-3 text-blue-500" />
                                ) : (
                                  <Layers className="h-3 w-3 text-primary" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs line-clamp-1 mb-0.5">
                                  v{versionIndex + 1}: {version.request}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatTimestamp(version.timestamp)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 h-6 w-6 opacity-0 group-hover/version:opacity-100 transition-opacity"
                                onClick={() => onSelectItem(item, version)}
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

