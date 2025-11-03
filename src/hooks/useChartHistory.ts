'use client';

import { useState, useEffect } from 'react';
import { ChartRequest, ChatMessage } from '@/lib/llm-service';

const STORAGE_KEY = 'chart-history';
const MAX_HISTORY_ITEMS = 10;

export interface ChartVersion {
  versionId: string;
  timestamp: number;
  request: string;
  charts: ChartRequest[];
  isAdjustment: boolean;
}

export interface HistoryItem {
  id: string;
  originalRequest: string;
  timestamp: number;
  versions: ChartVersion[];
  messages?: ChatMessage[]; // Contexto da conversa
}

// Interface antiga para migração
interface OldHistoryItem {
  id: string;
  timestamp: number;
  request: string;
  charts: ChartRequest[];
}

// Função para migrar estrutura antiga para nova
function migrateHistoryItem(item: any): HistoryItem {
  // Se já tem a estrutura nova com versions, retorna como está
  if (item.versions && Array.isArray(item.versions)) {
    return item as HistoryItem;
  }

  // Migração da estrutura antiga
  const timestamp = item.timestamp || Date.now();
  const version: ChartVersion = {
    versionId: `${item.id}-v1`,
    timestamp,
    request: item.request || '',
    charts: item.charts || [],
    isAdjustment: false,
  };

  return {
    id: item.id,
    originalRequest: item.request || '',
    timestamp,
    versions: [version],
    messages: [],
  };
}

export function useChartHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar histórico do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migrar cada item para a nova estrutura
        const migrated = Array.isArray(parsed) 
          ? parsed.map(migrateHistoryItem)
          : [];
        setHistory(migrated);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      // Em caso de erro, limpa o histórico corrompido
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Salvar histórico no localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        console.error('Erro ao salvar histórico:', error);
      }
    }
  }, [history, isLoaded]);

  const addToHistory = (request: string, charts: ChartRequest[]) => {
    const timestamp = Date.now();
    const newVersion: ChartVersion = {
      versionId: `${timestamp}-v1`,
      timestamp,
      request,
      charts,
      isAdjustment: false,
    };

    const newItem: HistoryItem = {
      id: timestamp.toString(),
      originalRequest: request,
      timestamp,
      versions: [newVersion],
      messages: [],
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev];
      return updated.slice(0, MAX_HISTORY_ITEMS);
    });
  };

  const addNewChart = (request: string, charts: ChartRequest[], messages?: ChatMessage[]) => {
    const timestamp = Date.now();
    const newVersion: ChartVersion = {
      versionId: `${timestamp}-v1`,
      timestamp,
      request,
      charts,
      isAdjustment: false,
    };

    const newItem: HistoryItem = {
      id: timestamp.toString(),
      originalRequest: request,
      timestamp,
      versions: [newVersion],
      messages: messages || [],
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev];
      return updated.slice(0, MAX_HISTORY_ITEMS);
    });

    return newItem.id;
  };

  const addVersion = (
    historyId: string, 
    request: string, 
    charts: ChartRequest[], 
    isAdjustment: boolean = true,
    messages?: ChatMessage[]
  ) => {
    setHistory((prev) => {
      return prev.map((item) => {
        if (item.id === historyId) {
          const timestamp = Date.now();
          const versionNumber = item.versions.length + 1;
          const newVersion: ChartVersion = {
            versionId: `${historyId}-v${versionNumber}`,
            timestamp,
            request,
            charts,
            isAdjustment,
          };

          return {
            ...item,
            versions: [...item.versions, newVersion],
            messages: messages || item.messages,
            timestamp, // Atualizar timestamp do item principal
          };
        }
        return item;
      });
    });
  };

  const updateMessages = (historyId: string, messages: ChatMessage[]) => {
    setHistory((prev) => {
      return prev.map((item) => {
        if (item.id === historyId) {
          return { ...item, messages };
        }
        return item;
      });
    });
  };

  const removeFromHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const getHistoryItem = (id: string): HistoryItem | undefined => {
    return history.find((item) => item.id === id);
  };

  return {
    history,
    isLoaded,
    addToHistory,
    addNewChart,
    addVersion,
    updateMessages,
    removeFromHistory,
    clearHistory,
    getHistoryItem,
  };
}

